// Uso: node scripts/lances-concorrentes.mjs [url] [robôs] [idLeilão]
import { io } from "socket.io-client";
import { randomUUID } from "node:crypto";

const url = process.argv[2] ?? "http://localhost:8080";
const bots = Number(process.argv[3] ?? 30);
const auctionId = Number(process.argv[4] ?? 1);

const sockets = await Promise.all(
  Array.from(
    { length: bots },
    (_, i) =>
      new Promise((resolve) => {
        const s = io(url, { transports: ["websocket"], forceNew: true });
        s.on("hello", ({ nodeId }) =>
          resolve({
            s,
            nodeId,
            name: `robô-${String(i + 1).padStart(2, "0")}`,
          }),
        );
      }),
  ),
);

const perNode = {};
for (const { nodeId } of sockets) perNode[nodeId] = (perNode[nodeId] ?? 0) + 1;
console.log(`${bots} robôs conectados:`, perNode);

const { auctions } = await sockets[0].s.emitWithAck("auctions:get");
const auction = auctions.find((a) => a.id === auctionId);
const amount = auction.currentWinner
  ? auction.currentPrice + auction.minIncrement
  : auction.currentPrice;
console.log(
  `\n"${auction.title}" — todos vão dar R$ ${amount} ao mesmo tempo…\n`,
);

const results = await Promise.all(
  sockets.map(({ s, name }) =>
    s
      .emitWithAck("bid", {
        bidId: randomUUID(),
        auctionId,
        bidder: name,
        amount,
      })
      .then((r) => ({ name, ...r })),
  ),
);

const accepted = results.filter((r) => r.status === "accepted");
for (const r of accepted)
  console.log(`✅ ACEITO   ${r.name} (processado por ${r.node})`);
console.log(
  `❌ RECUSADOS ${results.length - accepted.length} lances (ex.: "${results.find((r) => r.status !== "accepted")?.reason}")`,
);
console.log(
  accepted.length === 1
    ? "\nConsistência OK: exatamente 1 vencedor."
    : `\nPROBLEMA: ${accepted.length} vencedores!`,
);

sockets.forEach(({ s }) => s.close());
process.exit(accepted.length === 1 ? 0 : 1);

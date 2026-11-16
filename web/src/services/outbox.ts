import { SOCKET_EVENTS, TIMINGS } from "../constants";
import type { BidResult, PendingBid } from "../types";
import { uuid } from "../utils/uuid";
import { updateConnection } from "./connection";
import { socket } from "./socket";

interface OutboxEntry {
  bid: PendingBid;
  inFlight: boolean;
  resolve: (result: BidResult) => void;
}

const outbox = new Map<string, OutboxEntry>();

function publishPending() {
  updateConnection({
    pending: [...outbox.values()].map((entry) => ({ ...entry.bid })),
  });
}

function handleAck(entry: OutboxEntry, err: Error | null, res: BidResult) {
  entry.inFlight = false;

  if (err || res.status === "error") {
    entry.bid.lastError = err
      ? "Sem resposta do servidor"
      : (res.reason ?? "Erro");
    publishPending();

    return;
  }

  outbox.delete(entry.bid.bidId);
  publishPending();
  entry.resolve(res);
}

function send(entry: OutboxEntry) {
  if (!socket.connected || entry.inFlight) return;

  entry.inFlight = true;
  entry.bid.attempts++;

  const { bidId, auctionId, bidder, amount } = entry.bid;

  socket
    .timeout(TIMINGS.bidAckTimeoutMs)
    .emit(
      SOCKET_EVENTS.bid,
      { bidId, auctionId, bidder, amount },
      (err: Error | null, res: BidResult) => handleAck(entry, err, res),
    );

  publishPending();
}

export function placeBid(
  auctionId: number,
  bidder: string,
  amount: number,
): Promise<BidResult> {
  return new Promise((resolve) => {
    const bid: PendingBid = {
      bidId: uuid(),
      auctionId,
      bidder,
      amount,
      attempts: 0,
      lastError: null,
    };

    const entry = { bid, inFlight: false, resolve };

    outbox.set(bid.bidId, entry);
    send(entry);
  });
}

setInterval(() => outbox.forEach(send), TIMINGS.outboxRetryEveryMs);

socket.on("connect", () => outbox.forEach(send));

socket.on("disconnect", () => {
  outbox.forEach((entry) => (entry.inFlight = false));
});

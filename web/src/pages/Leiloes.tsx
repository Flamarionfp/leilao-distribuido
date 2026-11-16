import { useCallback } from "react";
import ConnectionBadge from "../components/ConnectionBadge";
import PageHeader from "../components/PageHeader";
import Toasts from "../components/Toasts";
import AuctionCard from "../components/auctions/AuctionCard";
import BidFeed from "../components/auctions/BidFeed";
import NameForm from "../components/auctions/NameForm";
import { useAuctions } from "../hooks/useAuctions";
import { useConnection } from "../hooks/useConnection";
import { useNodeMigration } from "../hooks/useNodeMigration";
import { usePlayerName } from "../hooks/usePlayerName";
import { useServerNow } from "../hooks/useServerNow";
import { useToasts } from "../hooks/useToasts";
import { placeBid } from "../services/outbox";
import type { Auction } from "../types";
import { brl } from "../utils/format";

export default function Leiloes() {
  const [name, setName] = usePlayerName();
  const { auctions, feed, applyAuction } = useAuctions();
  const { toasts, toast } = useToasts();
  const { pending } = useConnection();
  const now = useServerNow();

  useNodeMigration(
    useCallback(
      (from, to) => toast("info", `Reconectado: ${from} → ${to}`),
      [toast],
    ),
  );

  async function bid(auction: Auction, amount: number) {
    const res = await placeBid(auction.id, name, amount);

    if (res.auction) applyAuction(res.auction);

    if (res.status === "accepted") {
      const retry = res.duplicate ? " (reenvio)" : "";

      toast("ok", `Lance de ${brl(amount)} aceito por ${res.node}${retry}`);
    } else {
      toast("fail", res.reason ?? "Lance recusado");
    }
  }

  if (!name) return <NameForm onSubmit={setName} />;

  return (
    <div className="min-h-dvh">
      <PageHeader
        sticky
        icon="🔨"
        title="Leilão Distribuído"
        subtitle={
          <button onClick={() => setName("")} className="hover:text-slate-200">
            {name} · trocar
          </button>
        }
      >
        <ConnectionBadge />
      </PageHeader>

      <Toasts toasts={toasts} />

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <section className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {auctions.length === 0 && (
            <p className="text-slate-400">Carregando leilões…</p>
          )}
          {auctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              me={name}
              now={now}
              pending={pending.filter((p) => p.auctionId === auction.id)}
              onBid={(amount) => bid(auction, amount)}
            />
          ))}
        </section>

        <BidFeed bids={feed} me={name} />
      </main>
    </div>
  );
}

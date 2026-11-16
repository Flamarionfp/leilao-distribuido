import { AUCTION_UI } from "../../constants";
import type { Auction, PendingBid } from "../../types";
import { brl, countdown } from "../../utils/format";
import BidControls from "./BidControls";

interface Props {
  auction: Auction;
  me: string;
  now: number;
  pending: PendingBid[];
  onBid: (amount: number) => void;
}

function minimumBid(auction: Auction) {
  return auction.currentWinner
    ? auction.currentPrice + auction.minIncrement
    : auction.currentPrice;
}

function priceLabel(auction: Auction, closed: boolean) {
  if (closed) return auction.currentWinner ? "Arrematado por" : "Sem lances";

  return auction.currentWinner ? "Lance atual" : "Lance inicial";
}

export default function AuctionCard({
  auction,
  me,
  now,
  pending,
  onBid,
}: Props) {
  const remaining = auction.endsAt - now;
  const closed = auction.status === "closed" || remaining <= 0;
  const winning = auction.currentWinner === me;
  const urgent = !closed && remaining < AUCTION_UI.urgentBelowMs;
  const minBid = minimumBid(auction);

  const ring =
    winning && !closed
      ? "ring-emerald-500/60"
      : urgent
        ? "ring-rose-500/60"
        : "ring-slate-800";

  const timer = closed
    ? "bg-slate-800 text-slate-400"
    : urgent
      ? "animate-pulse bg-rose-500/20 text-rose-300"
      : "bg-slate-800 text-slate-200";

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl bg-slate-900 ring-1 transition ${ring}`}
    >
      <div className="flex items-start gap-4 p-5">
        <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-slate-800 text-4xl">
          {auction.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-100">
            {auction.title}
          </h3>
          <p className="line-clamp-2 text-sm text-slate-400">
            {auction.description}
          </p>
        </div>
        <div
          className={`shrink-0 rounded-lg px-2.5 py-1 font-mono text-sm tabular-nums ${timer}`}
        >
          {closed ? "Encerrado" : countdown(remaining)}
        </div>
      </div>

      <div
        key={auction.version}
        className="animate-flash border-y border-slate-800 px-5 py-4"
      >
        <div className="text-xs uppercase tracking-wide text-slate-500">
          {priceLabel(auction, closed)}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-3xl font-bold tabular-nums text-amber-300">
            {brl(auction.currentPrice)}
          </span>
          <span className="text-sm text-slate-400">
            {auction.bidCount} lances
          </span>
        </div>
        {auction.currentWinner && (
          <div
            className={`mt-1 text-sm ${winning ? "font-semibold text-emerald-400" : "text-slate-300"}`}
          >
            {winning
              ? closed
                ? "🏆 Você venceu!"
                : "✓ Você está ganhando"
              : `por ${auction.currentWinner}`}
          </div>
        )}
      </div>

      {!closed && (
        <BidControls
          minBid={minBid}
          quickBid={minBid + auction.minIncrement * AUCTION_UI.quickBidSteps}
          pending={pending}
          onBid={onBid}
        />
      )}
    </article>
  );
}

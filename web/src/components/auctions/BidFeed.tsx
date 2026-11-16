import type { FeedBid } from "../../types";
import { brl, time } from "../../utils/format";

export default function BidFeed({ bids, me }: { bids: FeedBid[]; me: string }) {
  return (
    <aside className="h-fit rounded-2xl bg-slate-900 p-4 ring-1 ring-slate-800 lg:sticky lg:top-20">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Lances ao vivo
      </h2>
      {bids.length === 0 && (
        <p className="text-sm text-slate-500">Nenhum lance ainda.</p>
      )}
      <ul className="space-y-2">
        {bids.map((b) => (
          <li
            key={b.id}
            className="animate-slide-in rounded-lg bg-slate-800/60 px-3 py-2 text-sm"
          >
            <div className="flex justify-between gap-2">
              <span
                className={`truncate font-medium ${b.bidder === me ? "text-emerald-400" : ""}`}
              >
                {b.bidder}
              </span>
              <span className="font-semibold tabular-nums text-amber-300">
                {brl(b.amount)}
              </span>
            </div>
            <div className="flex justify-between gap-2 text-xs text-slate-500">
              <span className="truncate">{b.title}</span>
              <span className="shrink-0">
                {b.node} · {time(b.ts)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

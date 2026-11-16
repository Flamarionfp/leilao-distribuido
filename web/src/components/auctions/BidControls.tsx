import { useState } from "react";
import type { PendingBid } from "../../types";
import { brl } from "../../utils/format";

interface Props {
  minBid: number;
  quickBid: number;
  pending: PendingBid[];
  onBid: (amount: number) => void;
}

export default function BidControls({
  minBid,
  quickBid,
  pending,
  onBid,
}: Props) {
  const [custom, setCustom] = useState("");

  function submitCustom(e: React.FormEvent) {
    e.preventDefault();

    const value = Number(custom);

    if (Number.isInteger(value) && value > 0) {
      onBid(value);
      setCustom("");
    }
  }

  return (
    <div className="space-y-3 p-5">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onBid(minBid)}
          className="rounded-xl bg-amber-400 px-3 py-2.5 font-semibold text-slate-950 transition hover:bg-amber-300 active:scale-95"
        >
          {brl(minBid)}
        </button>
        <button
          onClick={() => onBid(quickBid)}
          className="rounded-xl bg-slate-800 px-3 py-2.5 font-semibold text-amber-300 ring-1 ring-amber-400/40 transition hover:bg-slate-700 active:scale-95"
        >
          {brl(quickBid)}
        </button>
      </div>

      <form onSubmit={submitCustom} className="flex gap-2">
        <input
          inputMode="numeric"
          value={custom}
          onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
          placeholder={`Outro valor (mín. ${minBid})`}
          className="min-w-0 flex-1 rounded-xl bg-slate-800 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 placeholder:text-slate-500 focus:ring-amber-400"
        />
        <button className="rounded-xl bg-slate-800 px-4 text-sm font-medium ring-1 ring-slate-700 hover:bg-slate-700">
          Dar lance
        </button>
      </form>

      {pending.length > 0 && (
        <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          ⏳ {pending.length} lance(s) aguardando confirmação
          {pending[0].attempts > 1 && ` · tentativa ${pending[0].attempts}`}
          {pending[0].lastError && ` · ${pending[0].lastError}`}
        </div>
      )}
    </div>
  );
}

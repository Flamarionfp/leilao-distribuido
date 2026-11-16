import { useState } from "react";
import { DURATION_OPTIONS } from "../../constants";
import { resetAuctions } from "../../services/api";
import Card from "../ui/Card";

const CHAOS_COMMANDS = [
  "make kill-lider",
  "make redis-failover",
  "make pg-failover",
];

export default function AdminPanel() {
  const [duration, setDuration] = useState(180);
  const [resetting, setResetting] = useState(false);

  async function reset() {
    setResetting(true);
    await resetAuctions(duration).catch(() => {});
    setResetting(false);
  }

  return (
    <Card title="Administração">
      <div className="flex gap-2">
        <select
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="rounded-lg bg-slate-800 px-2 py-2 text-sm ring-1 ring-slate-700"
        >
          {DURATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={reset}
          disabled={resetting}
          className="flex-1 rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
        >
          {resetting ? "Reiniciando…" : "Reiniciar leilões"}
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500">Para simular falhas:</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {CHAOS_COMMANDS.map((cmd) => (
          <code
            key={cmd}
            className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-300"
          >
            {cmd}
          </code>
        ))}
      </div>
    </Card>
  );
}

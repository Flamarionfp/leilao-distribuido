import type { ClusterEvent } from "../../types";
import { time } from "../../utils/format";
import Card from "../ui/Card";

const LEVEL_STYLES: Record<ClusterEvent["level"], string> = {
  info: "border-sky-500 text-sky-200",
  success: "border-emerald-500 text-emerald-200",
  warning: "border-amber-500 text-amber-200",
  error: "border-rose-500 text-rose-200",
};

export default function EventLog({ events }: { events: ClusterEvent[] }) {
  return (
    <Card title="Eventos do cluster" className="lg:col-span-3">
      <ol className="max-h-96 space-y-1.5 overflow-y-auto pr-1 font-mono text-sm">
        {events.length === 0 && (
          <li className="text-slate-500">Aguardando eventos…</li>
        )}
        {events.map((e) => (
          <li
            key={e.id}
            className={`animate-slide-in border-l-2 bg-slate-800/40 px-3 py-1.5 ${LEVEL_STYLES[e.level]}`}
          >
            <span className="text-slate-500">{time(e.ts)}</span>{" "}
            <span className="text-slate-400">[{e.node}]</span> {e.message}
          </li>
        ))}
      </ol>
    </Card>
  );
}

import type { DatabaseNode } from "../../types";
import Card from "../ui/Card";
import StatusDot from "../ui/StatusDot";

function roleBadge(node: DatabaseNode) {
  if (node.fenced) {
    return { label: "isolado (antigo)", style: "bg-rose-500/20 text-rose-300" };
  }

  if (node.isWriter) {
    return { label: "escrita", style: "bg-amber-400/20 text-amber-300" };
  }

  if (node.role === "replica") {
    return { label: "leitura", style: "bg-sky-500/20 text-sky-300" };
  }

  return { label: "fora", style: "bg-slate-700 text-slate-400" };
}

export default function PostgresPanel({
  nodes = [],
}: {
  nodes?: DatabaseNode[];
}) {
  return (
    <Card title="PostgreSQL (replicação)">
      <ul className="space-y-1.5 text-sm">
        {nodes.map((node) => {
          const badge = roleBadge(node);

          return (
            <li
              key={node.name}
              className="rounded-lg bg-slate-800/60 px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <StatusDot ok={node.role !== "down"} /> {node.name}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.style}`}
                >
                  {badge.label}
                </span>
              </div>
              {node.lagBytes !== null && (
                <div className="mt-1 text-xs text-slate-400">
                  Atraso de replicação: {node.lagBytes} bytes de WAL
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

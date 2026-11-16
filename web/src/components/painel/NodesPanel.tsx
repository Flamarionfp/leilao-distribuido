import type { ClusterNode, ClusterState } from "../../types";
import { seconds } from "../../utils/format";
import Card from "../ui/Card";
import StatusDot from "../ui/StatusDot";

function NodeCard({ node, now }: { node: ClusterNode; now: number }) {
  return (
    <div
      className={`rounded-xl p-4 ring-1 ${
        node.alive
          ? "bg-slate-800/60 ring-slate-700"
          : "bg-rose-950/40 ring-rose-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-semibold">
          <StatusDot ok={node.alive} /> {node.id}
        </span>
        {node.leader && node.alive && (
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-300">
            👑 líder
          </span>
        )}
      </div>

      {node.alive ? (
        <dl className="mt-3 space-y-1 text-sm text-slate-400">
          <div className="flex justify-between">
            <dt>Clientes</dt>
            <dd className="font-semibold tabular-nums text-slate-100">
              {node.clients}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>No ar há</dt>
            <dd className="tabular-nums">{seconds(now - node.startedAt)}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-sm text-rose-300">
          Sem heartbeat há {seconds(now - node.lastSeen)}
        </p>
      )}
    </div>
  );
}

export default function NodesPanel({
  cluster,
}: {
  cluster: ClusterState | null;
}) {
  const totalClients =
    cluster?.nodes
      .filter((n) => n.alive)
      .reduce((sum, n) => sum + n.clients, 0) ?? 0;

  return (
    <Card title="Nós de aplicação (Node + Socket.IO)" className="lg:col-span-2">
      <div className="grid gap-3 sm:grid-cols-3">
        {cluster?.nodes.map((node) => (
          <NodeCard key={node.id} node={node} now={cluster.now} />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400">
        <span>
          Clientes conectados:{" "}
          <strong className="text-slate-100">{totalClients}</strong>
        </span>
        <span>
          Líder:{" "}
          <strong className="text-slate-100">
            {cluster?.leader ?? "eleição em andamento…"}
          </strong>
        </span>
        {cluster?.stats && (
          <span>
            Lances:{" "}
            <strong className="text-slate-100">{cluster.stats.accepted}</strong>{" "}
            aceitos de {cluster.stats.total}
          </span>
        )}
      </div>
    </Card>
  );
}

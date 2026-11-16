import type { ClusterState } from "../../types";
import Card from "../ui/Card";
import StatusDot from "../ui/StatusDot";

export default function RedisPanel({
  redis,
}: {
  redis?: ClusterState["redis"];
}) {
  return (
    <Card title="Redis (pub/sub + coordenação)">
      <p className="mb-3 text-sm text-slate-400">
        Master atual:{" "}
        <strong className="font-mono text-slate-100">
          {redis?.master ?? "desconhecido"}
        </strong>
      </p>
      <ul className="space-y-1.5 text-sm">
        {redis?.sentinels.map((s) => (
          <li
            key={s.addr}
            className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2"
          >
            <span className="flex items-center gap-2">
              <StatusDot ok={s.up} /> {s.addr.split(":")[0]}
            </span>
            <span className="font-mono text-xs text-slate-400">
              {s.up ? `→ ${s.master}` : "fora"}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

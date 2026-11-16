import { useConnection } from "../hooks/useConnection";

export default function ConnectionBadge() {
  const { connected, nodeId, previousNodeId, rttMs, offsetMs } =
    useConnection();

  if (!connected) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1.5 text-sm text-amber-300 ring-1 ring-amber-500/40">
        <span className="size-2 animate-ping rounded-full bg-amber-400" />
        Reconectando{previousNodeId ? ` (${previousNodeId} caiu)` : ""}…
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-sm text-emerald-300 ring-1 ring-emerald-500/40"
      title={`RTT ${rttMs ?? "?"} ms · offset do relógio ${offsetMs} ms`}
    >
      <span className="size-2 rounded-full bg-emerald-400" />
      Conectado a <strong className="font-semibold">{nodeId ?? "…"}</strong>
      {rttMs !== null && (
        <span className="hidden text-emerald-400/70 sm:inline">
          · {rttMs} ms
        </span>
      )}
    </div>
  );
}

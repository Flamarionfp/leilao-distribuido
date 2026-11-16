import { TIMINGS } from "../constants";
import type { ClusterState } from "../types";

export async function fetchClusterState(): Promise<ClusterState> {
  const res = await fetch("/api/cluster", {
    signal: AbortSignal.timeout(TIMINGS.clusterRequestTimeoutMs),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.json();
}

export async function resetAuctions(durationSeconds: number) {
  await fetch("/api/admin/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ durationSeconds }),
  });
}

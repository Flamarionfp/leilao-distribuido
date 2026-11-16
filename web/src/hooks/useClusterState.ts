import { useEffect, useState } from "react";
import { LIMITS, TIMINGS } from "../constants";
import { fetchClusterState } from "../services/api";
import type { ClusterState } from "../types";

export function useClusterState() {
  const [cluster, setCluster] = useState<ClusterState | null>(null);
  const [apiDown, setApiDown] = useState(false);

  useEffect(() => {
    let active = true;

    let failures = 0;

    async function poll() {
      try {
        const data = await fetchClusterState();

        failures = 0;

        if (active) {
          setCluster(data);
          setApiDown(false);
        }
      } catch {
        // falha isolada durante failover é esperada; só alerta se persistir
        if (++failures >= LIMITS.apiFailuresBeforeAlert && active) {
          setApiDown(true);
        }
      }
    }

    void poll();

    const timer = setInterval(poll, TIMINGS.clusterPollEveryMs);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return { cluster, apiDown };
}

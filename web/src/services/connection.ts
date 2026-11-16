import { SOCKET_EVENTS, TIMINGS } from "../constants";
import type { ConnectionState } from "../types";
import { socket } from "./socket";

let state: ConnectionState = {
  connected: false,
  nodeId: null,
  previousNodeId: null,
  offsetMs: 0,
  rttMs: null,
  pending: [],
};

const listeners = new Set<() => void>();

export function getConnection() {
  return state;
}

export function updateConnection(patch: Partial<ConnectionState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

export function subscribeConnection(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export const serverNow = () => Date.now() + state.offsetMs;

// Algoritmo de Cristian: offset = horaServidor + RTT/2 − horaLocal (amostra de menor RTT)
async function measureClock() {
  const t0 = Date.now();
  const { serverTime } = await socket
    .timeout(TIMINGS.ackTimeoutMs)
    .emitWithAck(SOCKET_EVENTS.timeSync);
  const t1 = Date.now();
  const rtt = t1 - t0;

  return { rtt, offset: serverTime + rtt / 2 - t1 };
}

async function syncClock() {
  let best: { rtt: number; offset: number } | null = null;

  for (let i = 0; i < TIMINGS.clockSamples && socket.connected; i++) {
    try {
      const sample = await measureClock();

      if (!best || sample.rtt < best.rtt) best = sample;
    } catch {
      break;
    }
  }

  if (best) {
    updateConnection({ offsetMs: Math.round(best.offset), rttMs: best.rtt });
  }
}

setInterval(syncClock, TIMINGS.clockSyncEveryMs);

socket.on("connect", () => {
  updateConnection({ connected: true });
  void syncClock();
});

socket.on("disconnect", () => {
  updateConnection({
    connected: false,
    previousNodeId: state.nodeId ?? state.previousNodeId,
    nodeId: null,
  });
});

socket.on(SOCKET_EVENTS.hello, ({ nodeId }: { nodeId: string }) =>
  updateConnection({ nodeId }),
);

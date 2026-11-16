import type { Server } from "socket.io";
import { env } from "../config/env.js";
import { HEARTBEAT, REDIS_KEYS } from "../config/constants.js";
import { redis } from "../lib/redis.js";
import { logEvent } from "./events.js";

export interface NodeInfo {
  id: string;
  clients: number;
  startedAt: number;
  lastSeen: number;
}

const startedAt = Date.now();

const deadNodes = new Set<string>();

export function startHeartbeat(io: Server) {
  setInterval(() => {
    const info: NodeInfo = {
      id: env.nodeId,
      clients: io.engine.clientsCount,
      startedAt,
      lastSeen: Date.now(),
    };

    redis
      .hset(REDIS_KEYS.nodes, env.nodeId, JSON.stringify(info))
      .catch(() => {});
  }, HEARTBEAT.everyMs);
}

export function isAlive(node: NodeInfo, now = Date.now()) {
  return now - node.lastSeen < HEARTBEAT.deadAfterMs;
}

export async function readNodes(): Promise<NodeInfo[]> {
  const raw = await redis.hgetall(REDIS_KEYS.nodes);

  return Object.values(raw)
    .map((value) => JSON.parse(value) as NodeInfo)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function detectNodeChanges() {
  const now = Date.now();

  for (const node of await readNodes()) {
    const dead = !isAlive(node, now);

    if (dead && !deadNodes.has(node.id)) {
      deadNodes.add(node.id);
      logEvent(
        "error",
        `${node.id} parou de enviar heartbeat — considerado fora do ar`,
      );
    } else if (!dead && deadNodes.has(node.id)) {
      deadNodes.delete(node.id);
      logEvent("success", `${node.id} voltou ao cluster`);
    }
  }
}

export function resetNodeTracking() {
  deadNodes.clear();
}

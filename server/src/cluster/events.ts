import { randomUUID } from "node:crypto";
import type { Server } from "socket.io";
import { env } from "../config/env.js";
import {
  EVENT_LOG,
  REDIS_KEYS,
  ROOMS,
  SOCKET_EVENTS,
} from "../config/constants.js";
import { redis } from "../lib/redis.js";

export type EventLevel = "info" | "success" | "warning" | "error";

export interface ClusterEvent {
  id: string;
  ts: number;
  node: string;
  level: EventLevel;
  message: string;
}

let io: Server | null = null;

export function bindEvents(server: Server) {
  io = server;
}

export function logEvent(level: EventLevel, message: string) {
  const event: ClusterEvent = {
    id: randomUUID(),
    ts: Date.now(),
    node: env.nodeId,
    level,
    message,
  };

  console.log(`[${env.nodeId}] ${level.toUpperCase()} ${message}`);
  io?.to(ROOMS.painel).emit(SOCKET_EVENTS.clusterEvent, event);

  redis
    .multi()
    .lpush(REDIS_KEYS.events, JSON.stringify(event))
    .ltrim(REDIS_KEYS.events, 0, EVENT_LOG.maxStored - 1)
    .exec()
    .catch(() => {});
}

export async function recentEvents(): Promise<ClusterEvent[]> {
  try {
    const raw = await redis.lrange(
      REDIS_KEYS.events,
      0,
      EVENT_LOG.recentLimit - 1,
    );

    return raw.map((e) => JSON.parse(e));
  } catch {
    return [];
  }
}

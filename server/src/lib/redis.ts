import { Redis } from "ioredis";
import { env } from "../config/env.js";

export function createRedis() {
  const client = new Redis({
    sentinels: env.redis.sentinels,
    name: env.redis.masterName,
    maxRetriesPerRequest: 2,
    reconnectOnError: (err) => err.message.startsWith("READONLY"),
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });

  client.on("error", () => {});

  return client;
}

export const redis = createRedis();

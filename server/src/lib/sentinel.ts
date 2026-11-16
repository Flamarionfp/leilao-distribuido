import { Redis } from "ioredis";
import { env } from "../config/env.js";
import { withTimeout } from "../utils/promise.js";

const SENTINEL_TIMEOUT_MS = 800;

const sentinels = env.redis.sentinels.map(({ host, port }) => {
  const client = new Redis({
    host,
    port,
    lazyConnect: true,
    maxRetriesPerRequest: 0,
    retryStrategy: () => 1000,
  });

  client.on("error", () => {});

  return { addr: `${host}:${port}`, client };
});

async function askMaster(client: Redis) {
  if (client.status === "wait") await client.connect();

  const res = (await withTimeout(
    client.call("SENTINEL", "get-master-addr-by-name", env.redis.masterName),
    SENTINEL_TIMEOUT_MS,
  )) as [string, string] | null;

  return res ? `${res[0]}:${res[1]}` : null;
}

export async function sentinelStatus() {
  const results = await Promise.all(
    sentinels.map(async ({ addr, client }) => {
      try {
        return { addr, up: true, master: await askMaster(client) };
      } catch {
        return { addr, up: false, master: null };
      }
    }),
  );

  const master = results.find((r) => r.master)?.master ?? null;

  return { master, sentinels: results };
}

import { env } from "../config/env.js";
import { databaseStatus } from "../lib/database.js";
import { sentinelStatus } from "../lib/sentinel.js";
import { bidStats } from "../auctions/repository.js";
import { isAlive, readNodes } from "./heartbeat.js";
import { getLeader } from "./leader.js";

export async function clusterStatus() {
  const now = Date.now();
  const leader = getLeader();

  const [nodes, redis, stats] = await Promise.all([
    readNodes().catch(() => []),
    sentinelStatus(),
    bidStats().catch(() => null),
  ]);

  return {
    servedBy: env.nodeId,
    now,
    leader,
    nodes: nodes.map((n) => ({
      ...n,
      alive: isAlive(n, now),
      leader: n.id === leader,
    })),
    redis,
    db: databaseStatus(),
    stats,
  };
}

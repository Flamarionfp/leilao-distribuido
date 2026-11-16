import pg from "pg";
import { env } from "../config/env.js";
import { DB_FAILOVER, REDIS_KEYS } from "../config/constants.js";
import { logEvent } from "../cluster/events.js";
import { lsnLagBytes, parseLsn } from "../utils/lsn.js";
import { redis } from "./redis.js";

export type DbRole = "primary" | "replica" | "down";

export interface DbNode {
  name: string;
  pool: pg.Pool;
  role: DbRole;
  failures: number;
  lsn: bigint | null;
}

const PROBE_SQL = `
  SELECT pg_is_in_recovery() AS rec,
         (CASE WHEN pg_is_in_recovery() THEN pg_last_wal_replay_lsn()
               ELSE pg_current_wal_lsn() END)::text AS lsn`;

export const dbNodes: DbNode[] = env.databases.map(({ name, url }) => {
  const pool = new pg.Pool({
    connectionString: url,
    max: 10,
    connectionTimeoutMillis: 1500,
    idleTimeoutMillis: 10_000,
    query_timeout: 4000,
  });

  pool.on("error", () => {});

  return { name, pool, role: "down", failures: 0, lsn: null };
});

let writerName = dbNodes[0].name;

export function getWriter() {
  return dbNodes.find((n) => n.name === writerName)!;
}

export function getReader() {
  const replica = dbNodes.find(
    (n) => n.name !== writerName && n.role === "replica",
  );

  return replica ?? getWriter();
}

async function probeNode(node: DbNode) {
  try {
    const { rows } = await node.pool.query(PROBE_SQL);

    node.role = rows[0].rec ? "replica" : "primary";
    node.lsn = rows[0].lsn ? parseLsn(rows[0].lsn) : null;
    node.failures = 0;
  } catch {
    node.role = "down";
    node.lsn = null;
    node.failures++;
  }
}

async function syncWriterFromRedis() {
  try {
    const stored = await redis.get(REDIS_KEYS.dbWriter);

    if (stored && dbNodes.some((n) => n.name === stored)) writerName = stored;
  } catch {
    logEvent("error", "Falha ao ler nó primário do Redis");
  }
}

export async function probeDatabases() {
  await Promise.all(dbNodes.map(probeNode));
  await syncWriterFromRedis();
}

export function startDatabaseProbe() {
  setInterval(() => void probeDatabases(), DB_FAILOVER.probeEveryMs);
}

export async function promoteReplicaIfNeeded(): Promise<string | null> {
  const writer = getWriter();
  const writerIsDown =
    writer.role === "down" &&
    writer.failures >= DB_FAILOVER.failuresBeforePromote;

  if (!writerIsDown) return null;

  const candidate = dbNodes.find(
    (n) => n.name !== writer.name && n.role === "replica",
  );

  if (!candidate) return null;

  await candidate.pool.query("SELECT pg_promote(true, 10)");
  await redis.set(REDIS_KEYS.dbWriter, candidate.name);

  writerName = candidate.name;
  candidate.role = "primary";

  return `${writer.name} fora do ar — ${candidate.name} promovido a primário`;
}

export function databaseStatus() {
  const writer = getWriter();

  return {
    writer: writer.name,
    nodes: dbNodes.map((n) => ({
      name: n.name,
      role: n.role,
      isWriter: n.name === writer.name,
      fenced: n.role === "primary" && n.name !== writer.name,
      lagBytes:
        n.role === "replica" && n.lsn !== null && writer.lsn !== null
          ? lsnLagBytes(writer.lsn, n.lsn)
          : null,
    })),
  };
}

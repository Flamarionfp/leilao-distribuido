import { env } from "../config/env.js";
import { LEADER, REDIS_KEYS } from "../config/constants.js";
import { redis } from "../lib/redis.js";
import { logEvent } from "./events.js";

const KEY = REDIS_KEYS.leader;

const RENEW = `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('pexpire', KEYS[1], ARGV[2]) else return 0 end`;

const RELEASE = `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end`;

let leader = false;

let currentLeader: string | null = null;

const listeners: Array<(isLeader: boolean) => void> = [];

function setLeader(value: boolean) {
  if (value === leader) return;

  leader = value;
  listeners.forEach((fn) => fn(value));
}

async function tick() {
  try {
    if (leader) {
      const renewed = await redis.eval(RENEW, 1, KEY, env.nodeId, LEADER.ttlMs);

      if (!renewed) setLeader(false);
    } else {
      const acquired = await redis.set(
        KEY,
        env.nodeId,
        "PX",
        LEADER.ttlMs,
        "NX",
      );

      if (acquired === "OK") setLeader(true);
    }

    currentLeader = await redis.get(KEY);
  } catch {
    logEvent("error", "Falha ao renovar liderança");
    setLeader(false);
    currentLeader = null;
  }
}

export function startLeaderElection() {
  void tick();
  setInterval(tick, LEADER.renewEveryMs);
}

export async function resignLeadership() {
  if (!leader) return;

  await redis.eval(RELEASE, 1, KEY, env.nodeId).catch(() => {});
  setLeader(false);
}

export const isLeader = () => leader;

export const getLeader = () => currentLeader;

export const onLeaderChange = (fn: (isLeader: boolean) => void) =>
  listeners.push(fn);

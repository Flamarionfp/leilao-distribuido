import type { Server } from "socket.io";
import { env } from "../config/env.js";
import { LEADER } from "../config/constants.js";
import { promoteReplicaIfNeeded } from "../lib/database.js";
import {
  closeExpiredAuctions,
  countAuctions,
  resetAuctions,
} from "../auctions/repository.js";
import { broadcastAuction, broadcastReset } from "../socket/broadcast.js";
import { formatBRL } from "../utils/money.js";
import { errorMessage } from "../utils/promise.js";
import { logEvent } from "./events.js";
import { detectNodeChanges, resetNodeTracking } from "./heartbeat.js";
import { isLeader, onLeaderChange } from "./leader.js";

let busy = false;

async function closeAuctions(io: Server) {
  for (const auction of await closeExpiredAuctions()) {
    broadcastAuction(io, auction);
    logEvent(
      "success",
      auction.currentWinner
        ? `"${auction.title}" arrematado por ${auction.currentWinner} (${formatBRL(auction.currentPrice)})`
        : `"${auction.title}" encerrado sem lances`,
    );
  }
}

async function failoverDatabase() {
  try {
    const message = await promoteReplicaIfNeeded();

    if (message) logEvent("warning", message);
  } catch (err) {
    logEvent("error", `Falha ao promover réplica: ${errorMessage(err)}`);
  }
}

async function runTasks(io: Server) {
  if (!isLeader() || busy) return;

  busy = true;

  try {
    await Promise.allSettled([detectNodeChanges(), closeAuctions(io)]);
    await failoverDatabase();
  } finally {
    busy = false;
  }
}

async function seedIfEmpty(io: Server) {
  try {
    if ((await countAuctions()) > 0) return;

    await resetAuctions();
    broadcastReset(io);
    logEvent("info", "Catálogo de leilões criado");
  } catch (err) {
    logEvent("error", `Falha ao reiniciar leilões: ${errorMessage(err)}`);
  }
}

export function startLeaderTasks(io: Server) {
  setInterval(() => void runTasks(io), LEADER.tasksEveryMs);

  onLeaderChange(async (leader) => {
    if (!leader)
      return logEvent("warning", `${env.nodeId} deixou de ser líder`);

    logEvent("success", `${env.nodeId} eleito líder do cluster`);
    resetNodeTracking();
    await seedIfEmpty(io);
  });
}

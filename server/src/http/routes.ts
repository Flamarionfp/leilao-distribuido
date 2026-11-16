import { Router } from "express";
import type { Server } from "socket.io";
import { env } from "../config/env.js";
import { resetAuctions } from "../auctions/repository.js";
import { parseDuration } from "../auctions/validation.js";
import { logEvent } from "../cluster/events.js";
import { clusterStatus } from "../cluster/status.js";
import { broadcastReset } from "../socket/broadcast.js";
import { errorMessage } from "../utils/promise.js";

export function createApiRouter(io: Server) {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ ok: true, node: env.nodeId });
  });

  router.get("/cluster", async (_req, res) => {
    res.json(await clusterStatus());
  });

  router.post("/admin/reset", async (req, res) => {
    try {
      const duration = parseDuration(req.body?.durationSeconds);

      await resetAuctions(duration);
      broadcastReset(io);
      logEvent("info", `Leilões reiniciados (${duration}s cada)`);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ ok: false, error: errorMessage(err) });
    }
  });

  return router;
}

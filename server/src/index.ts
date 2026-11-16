import { createServer } from "node:http";
import express from "express";
import { env } from "./config/env.js";
import { probeDatabases, startDatabaseProbe } from "./lib/database.js";
import { bindEvents, logEvent } from "./cluster/events.js";
import { startHeartbeat } from "./cluster/heartbeat.js";
import { resignLeadership, startLeaderElection } from "./cluster/leader.js";
import { startLeaderTasks } from "./cluster/leader-tasks.js";
import { createSocketServer } from "./socket/server.js";
import { registerSocketHandlers } from "./socket/handlers.js";
import { createApiRouter } from "./http/routes.js";
import { errorMessage } from "./utils/promise.js";

const app = express();
const http = createServer(app);
const io = createSocketServer(http);

app.use(express.json());
app.use("/api", createApiRouter(io));

bindEvents(io);
registerSocketHandlers(io);
startHeartbeat(io);
startLeaderTasks(io);
startDatabaseProbe();

await probeDatabases();

http.listen(env.port, () => {
  console.log(`[${env.nodeId}] ouvindo na porta ${env.port}`);
  logEvent("info", `${env.nodeId} iniciado`);
  startLeaderElection();
});

// o redis-adapter não trata rejeições de publish() enquanto o Redis faz failover
process.on("unhandledRejection", (err) => {
  console.error(`[${env.nodeId}] rejeição não tratada:`, errorMessage(err));
});

process.on("SIGTERM", async () => {
  logEvent("warning", `${env.nodeId} desligando (SIGTERM)`);
  await resignLeadership();
  io.close();
  setTimeout(() => process.exit(0), 300);
});

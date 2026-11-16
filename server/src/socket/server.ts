import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createRedis } from "../lib/redis.js";

export function createSocketServer(http: HttpServer) {
  const io = new Server(http, { transports: ["websocket"] });
  const pub = createRedis();
  const sub = pub.duplicate();

  sub.on("error", () => {});
  io.adapter(createAdapter(pub, sub));

  return io;
}

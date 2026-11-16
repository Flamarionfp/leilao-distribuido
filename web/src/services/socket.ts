import { io } from "socket.io-client";

export const socket = io({
  transports: ["websocket"],
  reconnectionDelay: 300,
  reconnectionDelayMax: 1500,
});

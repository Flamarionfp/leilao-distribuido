import type { Server, Socket } from "socket.io";
import { env } from "../config/env.js";
import { ROOMS, SOCKET_EVENTS } from "../config/constants.js";
import { placeBid } from "../auctions/bidding.js";
import { listAuctions, recentBids } from "../auctions/repository.js";
import { parseBidInput } from "../auctions/validation.js";
import type { BidInput } from "../auctions/types.js";
import { logEvent, recentEvents } from "../cluster/events.js";
import { errorMessage } from "../utils/promise.js";
import { broadcastAuction, broadcastBid } from "./broadcast.js";

type Ack<T = unknown> = (response: T) => void;

async function handleAuctionsGet(ack: Ack) {
  try {
    const [{ auctions, source }, bids] = await Promise.all([
      listAuctions(),
      recentBids(),
    ]);

    ack({ auctions, bids, source, node: env.nodeId });
  } catch {
    ack({ auctions: null, bids: [], source: null, node: env.nodeId });
  }
}

async function handleBid(io: Server, payload: Partial<BidInput>, ack: Ack) {
  const input = parseBidInput(payload);

  if (!input) {
    return ack({
      status: "rejected",
      reason: "Lance inválido",
      node: env.nodeId,
    });
  }

  try {
    const result = await placeBid(input);

    ack(result);

    if (result.status !== "accepted" || result.duplicate || !result.auction) {
      return;
    }

    broadcastAuction(io, result.auction);
    broadcastBid(io, {
      id: input.bidId,
      auctionId: result.auction.id,
      title: result.auction.title,
      bidder: input.bidder,
      amount: input.amount,
      node: env.nodeId,
      ts: Date.now(),
    });
  } catch (err) {
    logEvent("error", `Falha ao gravar lance: ${errorMessage(err)}`);
    ack({
      status: "error",
      reason: "Banco indisponível, tentando novamente…",
      node: env.nodeId,
    });
  }
}

async function handlePainelJoin(socket: Socket, ack: Ack) {
  await socket.join(ROOMS.painel);
  ack(await recentEvents());
}

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    socket.emit(SOCKET_EVENTS.hello, { nodeId: env.nodeId });

    socket.on(SOCKET_EVENTS.timeSync, (ack: Ack) =>
      ack({ serverTime: Date.now() }),
    );
    socket.on(SOCKET_EVENTS.auctionsGet, handleAuctionsGet);
    socket.on(SOCKET_EVENTS.bid, (payload, ack) => handleBid(io, payload, ack));
    socket.on(SOCKET_EVENTS.painelJoin, (ack) => handlePainelJoin(socket, ack));
  });
}

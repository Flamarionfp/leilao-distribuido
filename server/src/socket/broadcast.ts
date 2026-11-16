import type { Server } from "socket.io";
import { SOCKET_EVENTS } from "../config/constants.js";
import type { Auction, FeedBid } from "../auctions/types.js";

export function broadcastAuction(io: Server, auction: Auction) {
  io.emit(SOCKET_EVENTS.auctionUpdate, auction);
}

export function broadcastBid(io: Server, bid: FeedBid) {
  io.emit(SOCKET_EVENTS.bidNew, bid);
}

export function broadcastReset(io: Server) {
  io.emit(SOCKET_EVENTS.auctionsReset);
}

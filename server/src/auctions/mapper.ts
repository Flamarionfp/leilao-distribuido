import type { Auction, FeedBid } from "./types.js";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function toAuction(row: any): Auction {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    emoji: row.emoji,
    startingPrice: row.starting_price,
    currentPrice: row.current_price,
    minIncrement: row.min_increment,
    currentWinner: row.current_winner,
    bidCount: row.bid_count,
    endsAt: new Date(row.ends_at).getTime(),
    status: row.status,
    version: row.version,
  };
}

export function toFeedBid(row: any): FeedBid {
  return {
    id: row.id,
    auctionId: row.auction_id,
    title: row.title,
    bidder: row.bidder,
    amount: row.amount,
    node: row.node_id,
    ts: new Date(row.created_at).getTime(),
  };
}

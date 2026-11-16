export interface Auction {
  id: number;
  title: string;
  description: string;
  emoji: string;
  startingPrice: number;
  currentPrice: number;
  minIncrement: number;
  currentWinner: string | null;
  bidCount: number;
  endsAt: number;
  status: "open" | "closed";
  version: number;
}

export interface FeedBid {
  id: string;
  auctionId: number;
  title: string;
  bidder: string;
  amount: number;
  node: string;
  ts: number;
}

export interface BidInput {
  bidId: string;
  auctionId: number;
  bidder: string;
  amount: number;
}

export type BidResult =
  | {
      status: "accepted" | "rejected";
      reason?: string;
      auction?: Auction;
      duplicate?: boolean;
      node: string;
    }
  | { status: "error"; reason: string; node: string };

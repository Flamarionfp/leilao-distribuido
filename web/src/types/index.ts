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

export interface BidResult {
  status: "accepted" | "rejected" | "error";
  reason?: string;
  auction?: Auction;
  duplicate?: boolean;
  node: string;
}

export interface PendingBid {
  bidId: string;
  auctionId: number;
  bidder: string;
  amount: number;
  attempts: number;
  lastError: string | null;
}

export interface ConnectionState {
  connected: boolean;
  nodeId: string | null;
  previousNodeId: string | null;
  offsetMs: number;
  rttMs: number | null;
  pending: PendingBid[];
}

export interface ClusterEvent {
  id: string;
  ts: number;
  node: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
}

export interface ClusterNode {
  id: string;
  clients: number;
  startedAt: number;
  lastSeen: number;
  alive: boolean;
  leader: boolean;
}

export interface SentinelInfo {
  addr: string;
  up: boolean;
  master: string | null;
}

export interface DatabaseNode {
  name: string;
  role: "primary" | "replica" | "down";
  isWriter: boolean;
  fenced: boolean;
  lagBytes: number | null;
}

export interface ClusterState {
  servedBy: string;
  now: number;
  leader: string | null;
  nodes: ClusterNode[];
  redis: { master: string | null; sentinels: SentinelInfo[] };
  db: { writer: string; nodes: DatabaseNode[] };
  stats: { total: number; accepted: number } | null;
}

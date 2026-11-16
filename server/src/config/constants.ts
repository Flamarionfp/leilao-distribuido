export const REDIS_KEYS = {
  leader: "cluster:leader",
  nodes: "cluster:nodes",
  events: "cluster:events",
  dbWriter: "cluster:db-writer",
} as const;

export const LEADER = {
  ttlMs: 5000,
  renewEveryMs: 1500,
  tasksEveryMs: 1000,
};

export const HEARTBEAT = {
  everyMs: 1000,
  deadAfterMs: 4000,
};

export const DB_FAILOVER = {
  probeEveryMs: 1500,
  failuresBeforePromote: 3,
};

export const AUCTION = {
  antiSnipingSeconds: 15,
  defaultDurationSeconds: 180,
  minDurationSeconds: 30,
  maxDurationSeconds: 3600,
  staggerSeconds: 30,
  recentBidsLimit: 15,
  maxBidderLength: 30,
};

export const EVENT_LOG = {
  maxStored: 100,
  recentLimit: 50,
};

export const ROOMS = {
  painel: "painel",
} as const;

export const SOCKET_EVENTS = {
  hello: "hello",
  timeSync: "time:sync",
  auctionsGet: "auctions:get",
  auctionsReset: "auctions:reset",
  auctionUpdate: "auction:update",
  bid: "bid",
  bidNew: "bid:new",
  painelJoin: "painel:join",
  clusterEvent: "cluster:event",
} as const;

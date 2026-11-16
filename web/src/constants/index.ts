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

export const STORAGE_KEYS = {
  playerName: "leilao:nome",
  publicUrl: "leilao:url",
} as const;

export const TIMINGS = {
  clockSyncEveryMs: 15_000,
  clockSamples: 5,
  ackTimeoutMs: 3000,
  bidAckTimeoutMs: 4000,
  outboxRetryEveryMs: 2000,
  countdownTickMs: 250,
  clusterPollEveryMs: 1000,
  clusterRequestTimeoutMs: 2500,
  toastDurationMs: 3500,
};

export const LIMITS = {
  feedSize: 15,
  eventsSize: 80,
  toasts: 4,
  playerNameLength: 30,
  apiFailuresBeforeAlert: 2,
};

export const AUCTION_UI = {
  urgentBelowMs: 15_000,
  quickBidSteps: 4,
};

export const DURATION_OPTIONS = [
  { value: 60, label: "1 min" },
  { value: 180, label: "3 min" },
  { value: 300, label: "5 min" },
  { value: 600, label: "10 min" },
];

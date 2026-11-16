function parseHosts(value: string) {
  return value.split(",").map((entry) => {
    const [host, port] = entry.trim().split(":");

    return { host, port: Number(port) };
  });
}

export const env = {
  nodeId: process.env.NODE_ID ?? `node-${process.pid}`,
  port: Number(process.env.PORT ?? 3000),
  redis: {
    sentinels: parseHosts(process.env.REDIS_SENTINELS ?? "localhost:26379"),
    masterName: process.env.REDIS_MASTER_NAME ?? "mymaster",
  },
  databases: [
    {
      name: "pg-primary",
      url:
        process.env.PG_PRIMARY_URL ??
        "postgres://leilao:leilao@localhost:5432/leilao",
    },
    {
      name: "pg-replica",
      url:
        process.env.PG_REPLICA_URL ??
        "postgres://leilao:leilao@localhost:5433/leilao",
    },
  ],
};

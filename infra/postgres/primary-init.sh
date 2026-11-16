#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'replicator';

  CREATE TABLE auctions (
    id              SERIAL PRIMARY KEY,
    title           TEXT        NOT NULL,
    description     TEXT        NOT NULL DEFAULT '',
    emoji           TEXT        NOT NULL DEFAULT '📦',
    starting_price  INTEGER     NOT NULL,
    current_price   INTEGER     NOT NULL,
    min_increment   INTEGER     NOT NULL DEFAULT 10,
    current_winner  TEXT,
    bid_count       INTEGER     NOT NULL DEFAULT 0,
    ends_at         TIMESTAMPTZ NOT NULL,
    status          TEXT        NOT NULL DEFAULT 'open',
    version         INTEGER     NOT NULL DEFAULT 0
  );

  CREATE TABLE bids (
    id          UUID PRIMARY KEY,
    auction_id  INTEGER     NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    bidder      TEXT        NOT NULL,
    amount      INTEGER     NOT NULL,
    node_id     TEXT        NOT NULL,
    accepted    BOOLEAN     NOT NULL,
    reason      TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX bids_created_idx ON bids (created_at DESC);
EOSQL

echo "host replication replicator all scram-sha-256" >> "$PGDATA/pg_hba.conf"

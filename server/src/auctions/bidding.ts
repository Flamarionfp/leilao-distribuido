import type { PoolClient } from "pg";
import { env } from "../config/env.js";
import { AUCTION } from "../config/constants.js";
import { getWriter } from "../lib/database.js";
import { formatBRL } from "../utils/money.js";
import { toAuction } from "./mapper.js";
import type { Auction, BidInput, BidResult } from "./types.js";

const APPLY_BID_SQL = `
  UPDATE auctions
     SET current_price  = $1,
         current_winner = $2,
         bid_count      = bid_count + 1,
         version        = version + 1,
         ends_at        = GREATEST(ends_at, now() + make_interval(secs => $4))
   WHERE id = $3
     AND status = 'open'
     AND ends_at > now()
     AND $1 >= CASE WHEN current_winner IS NULL THEN current_price
                    ELSE current_price + min_increment END
  RETURNING *`;

const INSERT_BID_SQL = `
  INSERT INTO bids (id, auction_id, bidder, amount, node_id, accepted, reason)
  VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`;

export function minimumBid(auction: Auction) {
  return auction.currentWinner
    ? auction.currentPrice + auction.minIncrement
    : auction.currentPrice;
}

function rejectionReason(auction: Auction) {
  const closed = auction.status !== "open" || auction.endsAt <= Date.now();

  return closed
    ? "Leilão encerrado"
    : `Lance mínimo agora é ${formatBRL(minimumBid(auction))}`;
}

async function findAuction(client: PoolClient, id: number) {
  const { rows } = await client.query("SELECT * FROM auctions WHERE id = $1", [
    id,
  ]);

  return rows[0] ? toAuction(rows[0]) : null;
}

async function findPreviousResult(
  client: PoolClient,
  input: BidInput,
): Promise<BidResult | null> {
  const { rows } = await client.query(
    "SELECT accepted, reason FROM bids WHERE id = $1",
    [input.bidId],
  );

  if (!rows[0]) return null;

  return {
    status: rows[0].accepted ? "accepted" : "rejected",
    reason: rows[0].reason ?? undefined,
    auction: (await findAuction(client, input.auctionId)) ?? undefined,
    duplicate: true,
    node: env.nodeId,
  };
}

async function applyBid(
  client: PoolClient,
  input: BidInput,
): Promise<BidResult> {
  const node = env.nodeId;

  const updated = await client.query(APPLY_BID_SQL, [
    input.amount,
    input.bidder,
    input.auctionId,
    AUCTION.antiSnipingSeconds,
  ]);

  if (updated.rows[0]) {
    return { status: "accepted", auction: toAuction(updated.rows[0]), node };
  }

  const auction = await findAuction(client, input.auctionId);

  if (!auction)
    return { status: "rejected", reason: "Leilão inexistente", node };

  return {
    status: "rejected",
    reason: rejectionReason(auction),
    auction,
    node,
  };
}

async function recordBid(
  client: PoolClient,
  input: BidInput,
  result: BidResult,
) {
  await client.query(INSERT_BID_SQL, [
    input.bidId,
    input.auctionId,
    input.bidder,
    input.amount,
    env.nodeId,
    result.status === "accepted",
    result.reason ?? null,
  ]);
}

export async function placeBid(input: BidInput): Promise<BidResult> {
  const client = await getWriter().pool.connect();

  try {
    await client.query("BEGIN");

    const previous = await findPreviousResult(client, input);

    if (previous) {
      await client.query("COMMIT");

      return previous;
    }

    const result = await applyBid(client, input);

    if (result.status === "rejected" && !result.auction) {
      await client.query("ROLLBACK");

      return result;
    }

    await recordBid(client, input, result);
    await client.query("COMMIT");

    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

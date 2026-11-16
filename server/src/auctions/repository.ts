import { AUCTION } from "../config/constants.js";
import { getReader, getWriter } from "../lib/database.js";
import { CATALOG } from "./catalog.js";
import { toAuction, toFeedBid } from "./mapper.js";

export async function listAuctions() {
  const reader = getReader();
  const { rows } = await reader.pool.query(
    "SELECT * FROM auctions ORDER BY id",
  );

  return { auctions: rows.map(toAuction), source: reader.name };
}

export async function recentBids(limit = AUCTION.recentBidsLimit) {
  const { rows } = await getReader().pool.query(
    `SELECT b.id, b.auction_id, b.bidder, b.amount, b.node_id, b.created_at, a.title
       FROM bids b JOIN auctions a ON a.id = b.auction_id
      WHERE b.accepted ORDER BY b.created_at DESC LIMIT $1`,
    [limit],
  );

  return rows.map(toFeedBid);
}

export async function closeExpiredAuctions() {
  const { rows } = await getWriter().pool.query(
    `UPDATE auctions SET status = 'closed', version = version + 1
      WHERE status = 'open' AND ends_at <= now() RETURNING *`,
  );

  return rows.map(toAuction);
}

export async function resetAuctions(
  durationSeconds = AUCTION.defaultDurationSeconds,
) {
  const client = await getWriter().pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE bids, auctions RESTART IDENTITY");

    for (const [i, item] of CATALOG.entries()) {
      await client.query(
        `INSERT INTO auctions (title, description, emoji, starting_price, current_price, min_increment, ends_at)
         VALUES ($1, $2, $3, $4, $4, $5, now() + make_interval(secs => $6))`,
        [
          item.title,
          item.description,
          item.emoji,
          item.price,
          item.increment,
          durationSeconds + i * AUCTION.staggerSeconds,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function countAuctions() {
  const { rows } = await getWriter().pool.query(
    "SELECT count(*)::int AS n FROM auctions",
  );

  return rows[0].n as number;
}

export async function bidStats() {
  const { rows } = await getReader().pool.query(
    `SELECT count(*)::int AS total, count(*) FILTER (WHERE accepted)::int AS accepted FROM bids`,
  );

  return rows[0] as { total: number; accepted: number };
}

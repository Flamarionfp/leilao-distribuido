import { AUCTION } from "../config/constants.js";
import type { BidInput } from "./types.js";

export function parseBidInput(payload: Partial<BidInput>): BidInput | null {
  const amount = Number(payload?.amount);
  const auctionId = Number(payload?.auctionId);
  const bidder = String(payload?.bidder ?? "")
    .trim()
    .slice(0, AUCTION.maxBidderLength);

  const valid =
    Boolean(payload?.bidId) &&
    Boolean(bidder) &&
    Number.isInteger(auctionId) &&
    Number.isInteger(amount) &&
    amount > 0;

  if (!valid) return null;

  return { bidId: String(payload.bidId), auctionId, bidder, amount };
}

export function parseDuration(value: unknown) {
  const seconds = Number(value) || AUCTION.defaultDurationSeconds;

  return Math.max(
    AUCTION.minDurationSeconds,
    Math.min(AUCTION.maxDurationSeconds, seconds),
  );
}

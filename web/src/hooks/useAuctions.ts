import { useCallback, useEffect, useMemo, useState } from "react";
import { LIMITS, SOCKET_EVENTS, TIMINGS } from "../constants";
import { socket } from "../services/socket";
import type { Auction, FeedBid } from "../types";

type AuctionMap = Record<number, Auction>;

// version evita "voltar no tempo" com mensagens fora de ordem ou snapshot atrasado da réplica
function isNewer(current: Auction | undefined, incoming: Auction) {
  return !current || incoming.version >= current.version;
}

function mergeSnapshot(prev: AuctionMap, snapshot: Auction[]) {
  const next: AuctionMap = {};

  for (const auction of snapshot) {
    next[auction.id] = isNewer(prev[auction.id], auction)
      ? auction
      : prev[auction.id];
  }

  return next;
}

export function useAuctions() {
  const [auctions, setAuctions] = useState<AuctionMap>({});
  const [feed, setFeed] = useState<FeedBid[]>([]);

  const applyAuction = useCallback((auction: Auction) => {
    setAuctions((map) =>
      isNewer(map[auction.id], auction)
        ? { ...map, [auction.id]: auction }
        : map,
    );
  }, []);

  useEffect(() => {
    async function loadSnapshot() {
      const res = await socket
        .timeout(TIMINGS.ackTimeoutMs)
        .emitWithAck(SOCKET_EVENTS.auctionsGet)
        .catch(() => null);

      if (!res?.auctions) return;

      setAuctions((prev) => mergeSnapshot(prev, res.auctions));
      setFeed(res.bids);
    }

    function addBid(bid: FeedBid) {
      setFeed((list) =>
        list.some((b) => b.id === bid.id)
          ? list
          : [bid, ...list].slice(0, LIMITS.feedSize),
      );
    }

    function reset() {
      setAuctions({});
      void loadSnapshot();
    }

    socket.on("connect", loadSnapshot);
    socket.on(SOCKET_EVENTS.auctionUpdate, applyAuction);
    socket.on(SOCKET_EVENTS.bidNew, addBid);
    socket.on(SOCKET_EVENTS.auctionsReset, reset);

    if (socket.connected) void loadSnapshot();

    return () => {
      socket.off("connect", loadSnapshot);
      socket.off(SOCKET_EVENTS.auctionUpdate, applyAuction);
      socket.off(SOCKET_EVENTS.bidNew, addBid);
      socket.off(SOCKET_EVENTS.auctionsReset, reset);
    };
  }, [applyAuction]);

  const list = useMemo(
    () => Object.values(auctions).sort((a, b) => a.id - b.id),
    [auctions],
  );

  return { auctions: list, feed, applyAuction };
}

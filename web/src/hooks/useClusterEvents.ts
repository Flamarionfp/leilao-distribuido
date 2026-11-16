import { useEffect, useState } from "react";
import { LIMITS, SOCKET_EVENTS, TIMINGS } from "../constants";
import { socket } from "../services/socket";
import type { ClusterEvent } from "../types";

export function useClusterEvents() {
  const [events, setEvents] = useState<ClusterEvent[]>([]);

  useEffect(() => {
    async function join() {
      const recent = await socket
        .timeout(TIMINGS.ackTimeoutMs)
        .emitWithAck(SOCKET_EVENTS.painelJoin)
        .catch(() => null);

      if (recent) setEvents(recent);
    }

    function addEvent(event: ClusterEvent) {
      setEvents((list) =>
        list.some((e) => e.id === event.id)
          ? list
          : [event, ...list].slice(0, LIMITS.eventsSize),
      );
    }

    socket.on("connect", join);
    socket.on(SOCKET_EVENTS.clusterEvent, addEvent);

    if (socket.connected) void join();

    return () => {
      socket.off("connect", join);
      socket.off(SOCKET_EVENTS.clusterEvent, addEvent);
    };
  }, []);

  return events;
}

import { useEffect, useState } from "react";
import { TIMINGS } from "../constants";
import { serverNow } from "../services/connection";

export function useServerNow(tickMs = TIMINGS.countdownTickMs) {
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    const timer = setInterval(() => setNow(serverNow()), tickMs);

    return () => clearInterval(timer);
  }, [tickMs]);

  return now;
}

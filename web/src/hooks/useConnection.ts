import { useSyncExternalStore } from "react";
import { getConnection, subscribeConnection } from "../services/connection";

export function useConnection() {
  return useSyncExternalStore(subscribeConnection, getConnection);
}

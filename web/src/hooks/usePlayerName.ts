import { useState } from "react";
import { LIMITS, STORAGE_KEYS } from "../constants";
import { readStorage, writeStorage } from "../utils/storage";

export function usePlayerName() {
  const [name, setName] = useState(
    () => readStorage(STORAGE_KEYS.playerName) ?? "",
  );

  function save(value: string) {
    const trimmed = value.trim().slice(0, LIMITS.playerNameLength);

    writeStorage(STORAGE_KEYS.playerName, trimmed);
    setName(trimmed);
  }

  return [name, save] as const;
}

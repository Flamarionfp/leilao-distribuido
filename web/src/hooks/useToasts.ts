import { useCallback, useState } from "react";
import { LIMITS, TIMINGS } from "../constants";

export type ToastKind = "ok" | "fail" | "info";

export interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((kind: ToastKind, text: string) => {
    const id = Math.random();

    setToasts((list) => [{ id, kind, text }, ...list].slice(0, LIMITS.toasts));
    setTimeout(
      () => setToasts((list) => list.filter((t) => t.id !== id)),
      TIMINGS.toastDurationMs,
    );
  }, []);

  return { toasts, toast };
}

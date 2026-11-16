import type { Toast, ToastKind } from "../hooks/useToasts";

const STYLES: Record<ToastKind, string> = {
  ok: "bg-emerald-950 text-emerald-200 ring-emerald-700",
  fail: "bg-rose-950 text-rose-200 ring-rose-700",
  info: "bg-sky-950 text-sky-200 ring-sky-700",
};

export default function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed right-4 top-20 z-20 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-slide-in rounded-xl px-4 py-3 text-sm shadow-lg ring-1 ${STYLES[t.kind]}`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

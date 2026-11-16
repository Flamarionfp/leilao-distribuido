export default function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block size-2.5 rounded-full ${
        ok ? "bg-emerald-400" : "animate-pulse bg-rose-500"
      }`}
    />
  );
}

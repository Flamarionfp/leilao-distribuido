export const brl = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

export const time = (ts: number) =>
  new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export function countdown(ms: number) {
  if (ms <= 0) return "00:00";

  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const seconds = (ms: number) => `${Math.round(ms / 1000)}s`;

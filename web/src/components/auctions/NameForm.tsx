import { useState } from "react";

export default function NameForm({
  onSubmit,
}: {
  onSubmit: (name: string) => void;
}) {
  const [draft, setDraft] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (draft.trim()) onSubmit(draft);
  }

  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-slate-900 p-6 ring-1 ring-slate-800"
      >
        <div className="text-5xl">🔨</div>
        <h1 className="text-2xl font-bold">Leilão Distribuído</h1>
        <p className="text-sm text-slate-400">
          Como você quer aparecer nos lances?
        </p>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Seu nome"
          className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none ring-1 ring-slate-700 focus:ring-amber-400"
        />
        <button className="w-full rounded-xl bg-amber-400 py-3 font-semibold text-slate-950 hover:bg-amber-300">
          Entrar
        </button>
      </form>
    </main>
  );
}

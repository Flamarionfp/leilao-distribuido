interface Props {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = "" }: Props) {
  return (
    <section
      className={`rounded-2xl bg-slate-900 p-5 ring-1 ring-slate-800 ${className}`}
    >
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

interface Props {
  icon: string;
  title: string;
  subtitle: React.ReactNode;
  children?: React.ReactNode;
  sticky?: boolean;
}

export default function PageHeader({
  icon,
  title,
  subtitle,
  children,
  sticky = false,
}: Props) {
  return (
    <header
      className={`border-b border-slate-800 ${
        sticky ? "sticky top-0 z-10 bg-slate-950/90 backdrop-blur" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h1 className="font-bold leading-tight">{title}</h1>
            <div className="text-xs text-slate-400">{subtitle}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {children}
        </div>
      </div>
    </header>
  );
}

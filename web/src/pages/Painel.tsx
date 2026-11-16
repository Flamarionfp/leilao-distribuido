import ConnectionBadge from "../components/ConnectionBadge";
import PageHeader from "../components/PageHeader";
import AdminPanel from "../components/painel/AdminPanel";
import EventLog from "../components/painel/EventLog";
import JoinPanel from "../components/painel/JoinPanel";
import NodesPanel from "../components/painel/NodesPanel";
import PostgresPanel from "../components/painel/PostgresPanel";
import RedisPanel from "../components/painel/RedisPanel";
import { useClusterEvents } from "../hooks/useClusterEvents";
import { useClusterState } from "../hooks/useClusterState";

function ApiBadge({
  apiDown,
  servedBy,
}: {
  apiDown: boolean;
  servedBy?: string;
}) {
  if (apiDown) {
    return (
      <span className="rounded-full bg-rose-500/15 px-3 py-1.5 text-rose-300 ring-1 ring-rose-500/40">
        API indisponível
      </span>
    );
  }

  if (!servedBy) return null;

  return (
    <span className="rounded-full bg-slate-800 px-3 py-1.5 text-slate-300">
      API respondida por <strong>{servedBy}</strong>
    </span>
  );
}

export default function Painel() {
  const { cluster, apiDown } = useClusterState();
  const events = useClusterEvents();

  return (
    <div className="min-h-dvh">
      <PageHeader
        icon="🛰️"
        title="Painel do cluster"
        subtitle={
          <a href="/" className="hover:text-slate-200">
            ir para os leilões →
          </a>
        }
      >
        <ApiBadge apiDown={apiDown} servedBy={cluster?.servedBy} />
        <ConnectionBadge />
      </PageHeader>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-3">
        <NodesPanel cluster={cluster} />
        <JoinPanel />
        <RedisPanel redis={cluster?.redis} />
        <PostgresPanel nodes={cluster?.db.nodes} />
        <AdminPanel />
        <EventLog events={events} />
      </main>
    </div>
  );
}

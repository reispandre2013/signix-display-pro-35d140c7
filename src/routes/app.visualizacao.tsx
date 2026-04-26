import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Monitor, Wifi, WifiOff, Megaphone, BarChart3, ArrowRight } from "lucide-react";
import { KpiCard } from "@/components/ui-kit/KpiCard";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { useScreens, useCampaigns } from "@/lib/hooks/use-supabase-data";

export const Route = createFileRoute("/app/visualizacao")({
  head: () => ({ meta: [{ title: "Painel de Visualização — Signix" }] }),
  component: VisualizacaoDashboard,
});

function VisualizacaoDashboard() {
  const screens = useScreens().data ?? [];
  const campaigns = useCampaigns().data ?? [];
  const online = screens.filter((s) => s.is_online).length;
  const offline = screens.filter((s) => s.device_status === "offline").length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de visualização"
        subtitle="Acesso somente leitura aos status, campanhas e relatórios."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-info/10 text-info px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
            <Eye className="h-3 w-3" /> Somente leitura
          </span>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Telas totais" value={screens.length} icon={Monitor} tone="primary" />
        <KpiCard
          label="Online"
          value={online}
          icon={Wifi}
          tone="success"
          hint={screens.length ? `${Math.round((online / screens.length) * 100)}%` : "—"}
        />
        <KpiCard label="Offline" value={offline} icon={WifiOff} tone="destructive" />
        <KpiCard
          label="Campanhas em execução"
          value={activeCampaigns.length}
          icon={Megaphone}
          tone="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          title="Campanhas em execução"
          actions={
            <Link
              to="/app/campanhas"
              className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
            >
              Ver detalhes <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          {activeCampaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma campanha em execução.
            </p>
          ) : (
            <ul className="divide-y divide-border -my-3">
              {activeCampaigns.slice(0, 6).map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">Prioridade {c.priority}</p>
                  </div>
                  <StatusBadge tone="success" label="No ar" />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Status dos dispositivos"
          actions={
            <Link
              to="/app/monitoramento"
              className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
            >
              Monitorar <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          {screens.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma tela cadastrada.
            </p>
          ) : (
            <ul className="divide-y divide-border -my-3">
              {screens.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <div
                    className={`h-9 w-9 rounded-lg grid place-items-center ${s.is_online ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                  >
                    <Monitor className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                  </div>
                  <StatusBadge status={s.device_status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Relatórios disponíveis" description="Acesse os relatórios consolidados.">
        <Link
          to="/app/relatorios"
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface"
        >
          <BarChart3 className="h-4 w-4 text-primary" /> Abrir central de relatórios
        </Link>
      </Panel>
    </div>
  );
}

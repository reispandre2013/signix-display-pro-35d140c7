import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Megaphone,
  ImageIcon,
  ListVideo,
  Monitor,
  Wifi,
  ArrowRight,
  Bell,
} from "lucide-react";
import { KpiCard } from "@/components/ui-kit/KpiCard";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import {
  useScreens,
  useCampaigns,
  useAlerts,
  useMedia,
  usePlaylists,
} from "@/lib/hooks/use-supabase-data";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/app/operador")({
  head: () => ({ meta: [{ title: "Painel do Operador — Signix" }] }),
  component: OperadorDashboard,
});

function OperadorDashboard() {
  const screens = useScreens().data ?? [];
  const campaigns = useCampaigns().data ?? [];
  const alerts = useAlerts().data ?? [];
  const media = useMedia().data ?? [];
  const playlists = usePlaylists().data ?? [];

  const online = screens.filter((s) => s.is_online).length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active");

  return (
    <div className="space-y-6">
      <PageHeader title="Painel operacional" subtitle="Tudo que você pode gerenciar e monitorar." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Telas permitidas" value={screens.length} icon={Monitor} tone="primary" />
        <KpiCard label="Online agora" value={online} icon={Wifi} tone="success" />
        <KpiCard
          label="Campanhas ativas"
          value={activeCampaigns.length}
          icon={Megaphone}
          tone="info"
        />
        <KpiCard label="Alertas operacionais" value={alerts.length} icon={Bell} tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KpiCard label="Mídias disponíveis" value={media.length} icon={ImageIcon} tone="primary" />
        <KpiCard label="Playlists" value={playlists.length} icon={ListVideo} tone="success" />
        <KpiCard label="Atividade recente" value={alerts.length} icon={Activity} tone="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          title="Campanhas que você gerencia"
          actions={
            <Link
              to="/app/campanhas"
              className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          {activeCampaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma campanha ativa.
            </p>
          ) : (
            <ul className="divide-y divide-border -my-3">
              {activeCampaigns.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">Prioridade {c.priority}</p>
                  </div>
                  <StatusBadge tone="success" label="Ativa" />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Alertas operacionais"
          actions={
            <Link
              to="/app/alertas"
              className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum alerta no momento.
            </p>
          ) : (
            <ul className="space-y-3">
              {alerts.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full ${a.severity === "critical" ? "bg-destructive" : a.severity === "high" ? "bg-warning" : "bg-info"} pulse-dot`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.alert_type}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(a.created_at), {
                        locale: ptBR,
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { ScrollText, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { useAuditLogPreview } from "@/lib/hooks/use-saas-data";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/admin-saas/logs")({
  head: () => ({ meta: [{ title: "Logs — SaaS Signix" }] }),
  component: LogsPage,
});

function LogsPage() {
  const { data: logs = [], isLoading } = useAuditLogPreview(100);

  if (isLoading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Logs e auditoria" subtitle="Todos os eventos relevantes da plataforma." />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Logs e auditoria" subtitle="Todos os eventos relevantes da plataforma." />

      <Panel title={`${logs.length} eventos recentes`}>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum evento de auditoria na base ainda.</p>
        ) : (
          <ul className="space-y-3">
            {logs.map((l) => (
              <li
                key={l.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-surface/50"
              >
                <div className="h-9 w-9 rounded-md bg-primary/10 grid place-items-center text-primary">
                  <ScrollText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{l.actor}</span>
                    <span className="text-muted-foreground"> · {l.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{l.target}</p>
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(l.created_at), { locale: ptBR, addSuffix: true })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

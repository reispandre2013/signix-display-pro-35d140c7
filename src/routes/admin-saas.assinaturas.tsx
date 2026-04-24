import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { MOCK_SAAS_CLIENTS } from "@/lib/saas-mock";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/admin-saas/assinaturas")({
  head: () => ({ meta: [{ title: "Assinaturas — SaaS Signix" }] }),
  component: AssinaturasPage,
});

function AssinaturasPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Assinaturas" subtitle="Todas as assinaturas ativas, em trial e canceladas." />

      <Panel title={`${MOCK_SAAS_CLIENTS.length} assinaturas`}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-5 py-2 font-medium">Cliente</th>
                <th className="px-3 py-2 font-medium">Plano</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Ciclo</th>
                <th className="px-3 py-2 font-medium">Início</th>
                <th className="px-3 py-2 font-medium">Próx. cobrança</th>
                <th className="px-5 py-2 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_SAAS_CLIENTS.map((c, i) => (
                <tr key={c.organization_id} className="hover:bg-surface/50">
                  <td className="px-5 py-3 font-medium">{c.organization_name}</td>
                  <td className="px-3 py-3 text-xs">{c.plan_name}</td>
                  <td className="px-3 py-3">
                    <StatusBadge
                      tone={c.subscription_status === "active" ? "success"
                        : c.subscription_status === "trialing" ? "info"
                        : c.subscription_status === "past_due" ? "warning"
                        : "destructive"}
                      label={c.subscription_status ?? "—"}
                      withDot={false}
                    />
                  </td>
                  <td className="px-3 py-3 text-xs">{i % 2 === 0 ? "Mensal" : "Anual"}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{format(new Date(c.created_at), "dd/MM/yy", { locale: ptBR })}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {c.last_payment_at ? format(new Date(new Date(c.last_payment_at).getTime() + 30 * 86400000), "dd/MM/yy", { locale: ptBR }) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-surface">
                      <CreditCard className="h-3 w-3" /> Gerir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

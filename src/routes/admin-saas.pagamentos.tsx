import { createFileRoute } from "@tanstack/react-router";
import { Receipt, Download } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { KpiCard } from "@/components/ui-kit/KpiCard";
import { MOCK_RECENT_PAYMENTS, MOCK_SAAS_METRICS } from "@/lib/saas-mock";
import { formatPrice } from "@/types/saas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin-saas/pagamentos")({
  head: () => ({ meta: [{ title: "Pagamentos — SaaS Signix" }] }),
  component: PagamentosPage,
});

function PagamentosPage() {
  const total = MOCK_RECENT_PAYMENTS.reduce((s, p) => s + p.amount_cents, 0);
  return (
    <div className="space-y-6">
      <PageHeader title="Pagamentos e faturas" subtitle="Movimentação financeira da plataforma." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Recebido (30d)" value={formatPrice(total)} icon={CheckCircle2} tone="success" />
        <KpiCard label="Pendentes" value={3} icon={Clock} tone="warning" />
        <KpiCard label="Vencidos" value={MOCK_SAAS_METRICS.overdue_invoices_count} icon={AlertTriangle} tone="destructive" />
        <KpiCard label="MRR" value={formatPrice(MOCK_SAAS_METRICS.mrr_cents)} icon={Receipt} tone="info" />
      </div>

      <Panel title="Transações recentes">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-5 py-2 font-medium">Cliente</th>
                <th className="px-3 py-2 font-medium">Método</th>
                <th className="px-3 py-2 font-medium">Valor</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Data</th>
                <th className="px-5 py-2 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_RECENT_PAYMENTS.map((p) => (
                <tr key={p.id} className="hover:bg-surface/50">
                  <td className="px-5 py-3 font-medium">{p.client}</td>
                  <td className="px-3 py-3 text-xs">{p.method}</td>
                  <td className="px-3 py-3 font-mono text-xs">{formatPrice(p.amount_cents)}</td>
                  <td className="px-3 py-3">
                    <StatusBadge tone={p.status === "paid" ? "success" : "warning"} label={p.status === "paid" ? "Pago" : "Pendente"} withDot={false} />
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{format(new Date(p.date), "dd/MM/yy HH:mm", { locale: ptBR })}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-surface">
                      <Download className="h-3 w-3" /> Recibo
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { Receipt, Download, CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { KpiCard } from "@/components/ui-kit/KpiCard";
import { useRecentSaaSPayments, useSaasMetrics } from "@/lib/hooks/use-saas-data";
import { formatPrice } from "@/types/saas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";
import { toast } from "sonner";

type ReceiptPayment = {
  id: string;
  client: string;
  amount_cents: number;
  method: string;
  status: string;
  created_at: string;
};

function downloadReceipt(p: ReceiptPayment) {
  const dateStr = format(new Date(p.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR });
  const lines = [
    "================================================",
    "          SIGNIX — RECIBO DE PAGAMENTO",
    "================================================",
    "",
    `Cliente:      ${p.client}`,
    `Método:       ${p.method}`,
    `Valor:        ${formatPrice(p.amount_cents)}`,
    `Status:       ${p.status === "paid" ? "PAGO" : "PENDENTE"}`,
    `Data:         ${dateStr}`,
    `ID da transação: ${p.id}`,
    "",
    "------------------------------------------------",
    "Documento gerado automaticamente pela plataforma",
    "Signix · " + format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    "================================================",
    "",
  ].join("\n");

  const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `recibo-${p.id.slice(0, 8)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Recibo baixado.");
}

const THIRTY_D = 30 * 86400000;

export const Route = createFileRoute("/admin-saas/pagamentos")({
  head: () => ({ meta: [{ title: "Pagamentos — SaaS Signix" }] }),
  component: PagamentosPage,
});

function PagamentosPage() {
  const { data: payments = [], isLoading: loadingP, isError, error } = useRecentSaaSPayments(100);
  const { data: metrics, isLoading: loadingM, isError: errMetrics, error: errM } = useSaasMetrics();

  const d30 = useMemo(() => Date.now() - THIRTY_D, []);
  const received30dCents = useMemo(
    () =>
      payments
        .filter((p) => p.status === "paid" && new Date(p.created_at).getTime() >= d30)
        .reduce((s, p) => s + p.amount_cents, 0),
    [payments, d30],
  );
  const pendingCount = useMemo(
    () => payments.filter((p) => p.status === "pending").length,
    [payments],
  );

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Pagamentos e faturas"
          subtitle="Movimentação financeira da plataforma."
        />
        <Panel>
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Erro ao carregar pagamentos."}
          </p>
        </Panel>
      </div>
    );
  }

  if (errMetrics) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Pagamentos e faturas"
          subtitle="Movimentação financeira da plataforma."
        />
        <Panel>
          <p className="text-sm text-destructive">
            {errM instanceof Error ? errM.message : "Erro ao carregar métricas."}
          </p>
        </Panel>
      </div>
    );
  }

  if ((loadingM && !metrics) || loadingP) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pagamentos e faturas"
          subtitle="Movimentação financeira da plataforma."
        />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const m = metrics!;

  return (
    <div className="space-y-6">
      <PageHeader title="Pagamentos e faturas" subtitle="Movimentação financeira da plataforma." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Recebido (30d)"
          value={formatPrice(received30dCents)}
          icon={CheckCircle2}
          tone="success"
        />
        <KpiCard label="Pendentes (amostra)" value={pendingCount} icon={Clock} tone="warning" />
        <KpiCard
          label="Faturas vencidas"
          value={m.overdue_invoices_count}
          icon={AlertTriangle}
          tone="destructive"
        />
        <KpiCard label="MRR" value={formatPrice(m.mrr_cents)} icon={Receipt} tone="info" />
      </div>

      <Panel title="Transações recentes">
        <p className="text-xs text-muted-foreground mb-3">
          Listagem a partir de <code className="text-[10px]">payments</code>.{" "}
          <Link to="/admin-saas" className="text-primary hover:underline">
            Visão geral
          </Link>
        </p>
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
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Nenhum pagamento registrado.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface/50">
                    <td className="px-5 py-3 font-medium">{p.client}</td>
                    <td className="px-3 py-3 text-xs">{p.method}</td>
                    <td className="px-3 py-3 font-mono text-xs">{formatPrice(p.amount_cents)}</td>
                    <td className="px-3 py-3">
                      <StatusBadge
                        tone={p.status === "paid" ? "success" : "warning"}
                        label={p.status === "paid" ? "Pago" : "Pendente"}
                        withDot={false}
                      />
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {format(new Date(p.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-surface"
                      >
                        <Download className="h-3 w-3" /> Recibo
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

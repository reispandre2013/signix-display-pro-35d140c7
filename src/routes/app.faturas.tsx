import { createFileRoute } from "@tanstack/react-router";
import { Receipt, Download, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { useOrgBillingContext, useOrgInvoices } from "@/lib/hooks/use-saas-data";
import { formatPrice } from "@/types/saas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/app/faturas")({
  head: () => ({ meta: [{ title: "Faturas — SigPlayer" }] }),
  component: FaturasPage,
});

function FaturasPage() {
  const { isMissingTables, isLoading: loadingCtx } = useOrgBillingContext();
  const { data: invoices = [], isLoading: loadingInv } = useOrgInvoices();
  const loading = loadingCtx || loadingInv;

  if (isMissingTables) {
    return (
      <div className="space-y-4">
        <PageHeader title="Faturas" subtitle="Histórico completo de cobranças da sua assinatura." />
        <Panel>
          <p className="text-sm text-muted-foreground">
            Tabelas de billing ainda não aplicadas. Execute as migrations em{" "}
            <code className="text-xs">supabase/migrations</code>.
          </p>
        </Panel>
      </div>
    );
  }

  if (loading && invoices.length === 0) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Faturas" subtitle="Histórico completo de cobranças da sua assinatura." />

      <Panel title={`${invoices.length} faturas`}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-5 py-2 font-medium">Número</th>
                <th className="px-3 py-2 font-medium">Emissão</th>
                <th className="px-3 py-2 font-medium">Vencimento</th>
                <th className="px-3 py-2 font-medium">Pagamento</th>
                <th className="px-3 py-2 font-medium">Método</th>
                <th className="px-3 py-2 font-medium">Valor</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-5 py-2 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Ainda não há faturas para esta organização.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface/50">
                    <td className="px-5 py-3 font-mono text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <Receipt className="h-3 w-3 text-primary" /> {inv.number ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {format(new Date(inv.issued_at), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {inv.due_at
                        ? format(new Date(inv.due_at), "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {inv.paid_at
                        ? format(new Date(inv.paid_at), "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs capitalize">{inv.payment_method ?? "—"}</td>
                    <td className="px-3 py-3 font-mono text-xs">{formatPrice(inv.amount_cents)}</td>
                    <td className="px-3 py-3">
                      <StatusBadge
                        tone={inv.status === "paid" ? "success" : "warning"}
                        label={inv.status === "paid" ? "Paga" : "Em aberto"}
                        withDot={false}
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      {inv.pdf_url ? (
                        <a
                          href={inv.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-surface"
                        >
                          <Download className="h-3 w-3" /> PDF
                        </a>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
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

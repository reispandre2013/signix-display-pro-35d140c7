import { createFileRoute } from "@tanstack/react-router";
import { Receipt, Download } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { MOCK_INVOICES } from "@/lib/saas-mock";
import { formatPrice } from "@/types/saas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/app/faturas")({
  head: () => ({ meta: [{ title: "Faturas — Signix" }] }),
  component: FaturasPage,
});

function FaturasPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Faturas" subtitle="Histórico completo de cobranças da sua assinatura." />

      <Panel title={`${MOCK_INVOICES.length} faturas`}>
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
              {MOCK_INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface/50">
                  <td className="px-5 py-3 font-mono text-xs">
                    <span className="inline-flex items-center gap-1.5"><Receipt className="h-3 w-3 text-primary" /> {inv.number}</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{format(new Date(inv.issued_at), "dd/MM/yyyy", { locale: ptBR })}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{inv.due_at ? format(new Date(inv.due_at), "dd/MM/yyyy", { locale: ptBR }) : "—"}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{inv.paid_at ? format(new Date(inv.paid_at), "dd/MM/yyyy", { locale: ptBR }) : "—"}</td>
                  <td className="px-3 py-3 text-xs capitalize">{inv.payment_method ?? "—"}</td>
                  <td className="px-3 py-3 font-mono text-xs">{formatPrice(inv.amount_cents)}</td>
                  <td className="px-3 py-3">
                    <StatusBadge tone={inv.status === "paid" ? "success" : "warning"} label={inv.status === "paid" ? "Paga" : "Em aberto"} withDot={false} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-surface">
                      <Download className="h-3 w-3" /> PDF
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

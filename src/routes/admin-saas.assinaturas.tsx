import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import {
  useSaaSAllSubscriptions,
  type SubscriptionsTableRow,
} from "@/lib/hooks/use-saas-data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin-saas/assinaturas")({
  head: () => ({ meta: [{ title: "Assinaturas — SaaS Signix" }] }),
  component: AssinaturasPage,
});

function AssinaturasPage() {
  const { data: rows = [], isLoading } = useSaaSAllSubscriptions();
  const [selected, setSelected] = useState<SubscriptionsTableRow | null>(null);

  if (isLoading && rows.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Assinaturas"
          subtitle="Todas as assinaturas ativas, em trial e canceladas."
        />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const fmtPrice = (cents: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assinaturas"
        subtitle="Todas as assinaturas ativas, em trial e canceladas."
      />

      <Panel title={`${rows.length} assinaturas`}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-5 py-2 font-medium">Cliente</th>
                <th className="px-3 py-2 font-medium">Plano</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Ciclo</th>
                <th className="px-3 py-2 font-medium">Valor</th>
                <th className="px-3 py-2 font-medium">Início do período</th>
                <th className="px-3 py-2 font-medium">Próxima cobrança</th>
                <th className="px-3 py-2 font-medium">Último pagamento</th>
                <th className="px-5 py-2 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma assinatura registrada.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="hover:bg-surface/50">
                    <td className="px-5 py-3 font-medium">{c.org_name}</td>
                    <td className="px-3 py-3 text-xs">{c.plan_name ?? "—"}</td>
                    <td className="px-3 py-3">
                      <StatusBadge
                        tone={
                          c.status === "active"
                            ? "success"
                            : c.status === "trialing"
                              ? "info"
                              : c.status === "past_due"
                                ? "warning"
                                : "destructive"
                        }
                        label={c.status}
                        withDot={false}
                      />
                    </td>
                    <td className="px-3 py-3 text-xs">{c.billing_cycle}</td>
                    <td className="px-3 py-3 text-xs font-mono tabular-nums">
                      {fmtPrice(c.amount_cents)}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {format(new Date(c.current_period_start), "dd/MM/yy", { locale: ptBR })}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {c.current_period_end
                        ? format(new Date(c.current_period_end), "dd/MM/yy", { locale: ptBR })
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {c.last_paid
                        ? format(new Date(c.last_paid), "dd/MM/yy", { locale: ptBR })
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(c)}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-surface"
                      >
                        <CreditCard className="h-3 w-3" /> Gerir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Assinatura — {selected?.org_name}
            </DialogTitle>
            <DialogDescription>
              Detalhes da assinatura. As ações de cobrança são gerenciadas pelo provedor de
              pagamento.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <DetailRow label="Plano" value={selected.plan_name ?? "—"} />
              <DetailRow label="Status" value={selected.status} />
              <DetailRow label="Ciclo" value={selected.billing_cycle} />
              <DetailRow label="Valor" value={fmtPrice(selected.amount_cents)} />
              <DetailRow
                label="Início do período"
                value={format(new Date(selected.current_period_start), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              />
              <DetailRow
                label="Próxima cobrança"
                value={
                  selected.current_period_end
                    ? format(new Date(selected.current_period_end), "dd/MM/yyyy", { locale: ptBR })
                    : "—"
                }
              />
              <DetailRow
                label="Último pagamento"
                value={
                  selected.last_paid
                    ? format(new Date(selected.last_paid), "dd/MM/yyyy", { locale: ptBR })
                    : "—"
                }
              />
              <DetailRow
                label="Criada em"
                value={format(new Date(selected.created_at), "dd/MM/yyyy", { locale: ptBR })}
              />
              <DetailRow label="ID da assinatura" value={selected.id} mono />
              <DetailRow label="ID da organização" value={selected.org_id} mono />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={mono ? "text-xs font-mono break-all" : "text-sm font-medium break-words"}>
        {value}
      </div>
    </div>
  );
}

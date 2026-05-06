import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, HardDrive, Loader2, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { RenewalCountdown } from "@/components/ui-kit/RenewalCountdown";
import {
  useSaaSAllSubscriptions,
  useAdminPlansCatalog,
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
import {
  changeSubscriptionPlan,
  setOrgStorageQuota,
} from "@/lib/server/saas-admin.functions";
import { withAuthHeader } from "@/lib/server/with-auth-header";

export const Route = createFileRoute("/admin-saas/assinaturas")({
  head: () => ({ meta: [{ title: "Assinaturas — SaaS SigPlayer" }] }),
  component: AssinaturasPage,
});

function AssinaturasPage() {
  const { data: rows = [], isLoading } = useSaaSAllSubscriptions();
  const { data: plans = [] } = useAdminPlansCatalog();
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
                <th className="px-3 py-2 font-medium">Faltam</th>
                <th className="px-3 py-2 font-medium">Último pagamento</th>
                <th className="px-5 py-2 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-sm text-muted-foreground">
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
                    <td className="px-3 py-3">
                      <RenewalCountdown endsAt={c.current_period_end} compact />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Assinatura — {selected?.org_name}
            </DialogTitle>
            <DialogDescription>
              Detalhes da assinatura. Como Super Admin você pode alterar manualmente o plano e a
              cota de armazenamento desta organização.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
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
                      ? format(new Date(selected.current_period_end), "dd/MM/yyyy", {
                          locale: ptBR,
                        })
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
                <div className="col-span-2 rounded-md border border-border bg-surface/40 p-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                    Tempo até a renovação
                  </div>
                  <RenewalCountdown endsAt={selected.current_period_end} />
                </div>
              </div>

              <AdminControls
                subscription={selected}
                plans={plans.map((p) => ({
                  id: p.id,
                  name: p.name,
                  price_monthly_cents: p.price_monthly_cents,
                  price_yearly_cents: p.price_yearly_cents,
                }))}
                onDone={() => setSelected(null)}
              />
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

type AdminPlanOption = {
  id: string;
  name: string;
  price_monthly_cents: number;
  price_yearly_cents: number;
};

function AdminControls({
  subscription,
  plans,
  onDone,
}: {
  subscription: SubscriptionsTableRow;
  plans: AdminPlanOption[];
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const changePlanFn = useServerFn(changeSubscriptionPlan);
  const setStorageFn = useServerFn(setOrgStorageQuota);

  const [planId, setPlanId] = useState<string>("");
  const [cycle, setCycle] = useState<"monthly" | "yearly">(
    subscription.billing_cycle === "Anual" ? "yearly" : "monthly",
  );
  const [storageMb, setStorageMb] = useState<number>(0);

  useEffect(() => {
    setPlanId("");
    setCycle(subscription.billing_cycle === "Anual" ? "yearly" : "monthly");
    setStorageMb(0);
  }, [subscription.id, subscription.billing_cycle]);

  const planMutation = useMutation({
    mutationFn: async () =>
      withAuthHeader(() =>
        changePlanFn({
          data: {
            subscription_id: subscription.id,
            plan_id: planId,
            billing_cycle: cycle,
          },
        }),
      ),
    onSuccess: () => {
      toast.success("Plano da assinatura atualizado.");
      queryClient.invalidateQueries({ queryKey: ["saas", "subscriptions", "all"] });
      onDone();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Falha ao alterar plano."),
  });

  const storageMutation = useMutation({
    mutationFn: async () =>
      withAuthHeader(() =>
        setStorageFn({
          data: { organization_id: subscription.org_id, max_storage_mb: storageMb },
        }),
      ),
    onSuccess: (res) => {
      toast.success(`Cota de armazenamento ajustada para ${res.max_storage_mb.toLocaleString("pt-BR")} MB.`);
      queryClient.invalidateQueries({ queryKey: ["saas"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Falha ao definir cota de armazenamento."),
  });

  return (
    <div className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
          Super Admin
        </span>
        <span className="text-xs text-muted-foreground">Controles manuais</span>
      </div>

      {/* Mudança de plano */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Package className="h-4 w-4 text-primary" /> Alterar plano
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="rounded-md border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Selecione um novo plano…</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={cycle}
            onChange={(e) => setCycle(e.target.value as "monthly" | "yearly")}
            className="rounded-md border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
          <button
            type="button"
            disabled={!planId || planMutation.isPending}
            onClick={() => planMutation.mutate()}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {planMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Aplicar plano
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Atualiza plano, ciclo e valor da assinatura. Não cobra automaticamente — usado para
          ajustes manuais pelo Super Admin.
        </p>
      </div>

      {/* Storage manual */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <HardDrive className="h-4 w-4 text-primary" /> Cota de armazenamento (MB)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="number"
            min={0}
            value={storageMb}
            onChange={(e) => setStorageMb(Number(e.target.value))}
            placeholder="Ex.: 10000 (10 GB)"
            className="rounded-md border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring md:col-span-2"
          />
          <button
            type="button"
            disabled={storageMb < 0 || storageMutation.isPending}
            onClick={() => storageMutation.mutate()}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {storageMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Aplicar cota
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Sobrescreve o limite de armazenamento do plano para esta organização (via licença
          ativa). Use para liberar mais megabytes manualmente.
        </p>
      </div>
    </div>
  );
}

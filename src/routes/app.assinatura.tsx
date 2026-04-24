import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Tv, Users, HardDrive, Calendar, ArrowUpCircle, ArrowDownCircle, XCircle, Receipt, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { KpiCard } from "@/components/ui-kit/KpiCard";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { MOCK_CURRENT_SUBSCRIPTION, MOCK_CURRENT_USAGE, MOCK_INVOICES } from "@/lib/saas-mock";
import { formatPrice } from "@/types/saas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/app/assinatura")({
  head: () => ({ meta: [{ title: "Minha assinatura — Signix" }] }),
  component: AssinaturaPage,
});

function AssinaturaPage() {
  const sub = MOCK_CURRENT_SUBSCRIPTION;
  const u = MOCK_CURRENT_USAGE;
  const screensPct = (u.screens_used / u.screens_limit) * 100;
  const usersPct = (u.users_used / u.users_limit) * 100;
  const storagePct = (u.storage_used_gb / u.storage_limit_gb) * 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minha assinatura"
        subtitle="Gerencie seu plano, limites e cobranças."
        actions={
          <Link to="/planos" className="inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
            <ArrowUpCircle className="h-3.5 w-3.5" /> Fazer upgrade
          </Link>
        }
      />

      <Panel>
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-primary grid place-items-center shadow-glow text-primary-foreground">
              <CreditCard className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Plano atual</p>
              <h3 className="font-display text-2xl font-bold">{sub.plan?.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge tone="success" label="Ativa" />
                <span className="text-xs text-muted-foreground">Cobrança {sub.billing_cycle === "monthly" ? "mensal" : "anual"}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-bold">{formatPrice(sub.amount_cents)}<span className="text-sm text-muted-foreground">/mês</span></p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
              <Calendar className="h-3 w-3" /> Próxima cobrança em {format(new Date(sub.current_period_end), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UsageCard label="Telas em uso" used={u.screens_used} limit={u.screens_limit} pct={screensPct} icon={Tv} unit="" />
        <UsageCard label="Usuários" used={u.users_used} limit={u.users_limit} pct={usersPct} icon={Users} unit="" />
        <UsageCard label="Armazenamento" used={u.storage_used_gb} limit={u.storage_limit_gb} pct={storagePct} icon={HardDrive} unit="GB" />
      </div>

      {screensPct >= 80 && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-warning">Você está próximo do limite de telas</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Faça upgrade do plano para liberar mais telas e evitar bloqueio de novas ativações.
            </p>
          </div>
          <Link to="/planos" className="text-xs font-semibold text-primary hover:underline">Ver planos →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2" title="Histórico de faturas">
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-5 py-2 font-medium">Número</th>
                  <th className="px-3 py-2 font-medium">Emissão</th>
                  <th className="px-3 py-2 font-medium">Valor</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-5 py-2 font-medium text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-5 py-3 font-mono text-xs">{inv.number}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{format(new Date(inv.issued_at), "dd/MM/yyyy", { locale: ptBR })}</td>
                    <td className="px-3 py-3 font-mono text-xs">{formatPrice(inv.amount_cents)}</td>
                    <td className="px-3 py-3">
                      <StatusBadge tone={inv.status === "paid" ? "success" : "warning"} label={inv.status === "paid" ? "Paga" : "Em aberto"} withDot={false} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-surface">
                        <Receipt className="h-3 w-3" /> Baixar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Ações da assinatura">
          <div className="space-y-2">
            <Link to="/planos" className="w-full flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5 text-sm hover:bg-surface">
              <span className="flex items-center gap-2"><ArrowUpCircle className="h-4 w-4 text-success" /> Fazer upgrade</span>
              <span className="text-muted-foreground">→</span>
            </Link>
            <button className="w-full flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5 text-sm hover:bg-surface">
              <span className="flex items-center gap-2"><ArrowDownCircle className="h-4 w-4 text-info" /> Fazer downgrade</span>
              <span className="text-muted-foreground">→</span>
            </button>
            <button className="w-full flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5 text-sm hover:bg-surface">
              <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Alterar forma de pagamento</span>
              <span className="text-muted-foreground">→</span>
            </button>
            <button className="w-full flex items-center justify-between gap-2 rounded-md border border-destructive/30 px-3 py-2.5 text-sm hover:bg-destructive/10 text-destructive">
              <span className="flex items-center gap-2"><XCircle className="h-4 w-4" /> Cancelar assinatura</span>
              <span>→</span>
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function UsageCard({ label, used, limit, pct, icon: Icon, unit }: {
  label: string; used: number; limit: number; pct: number; icon: React.ComponentType<{ className?: string }>; unit: string;
}) {
  const tone = pct >= 90 ? "destructive" : pct >= 75 ? "warning" : "success";
  const colorClass = tone === "destructive" ? "bg-destructive" : tone === "warning" ? "bg-warning" : "bg-success";
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="font-display text-2xl font-bold mt-2">
        {used}{unit && ` ${unit}`}<span className="text-sm text-muted-foreground"> / {limit >= 9999 ? "∞" : `${limit}${unit && ` ${unit}`}`}</span>
      </p>
      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${colorClass}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{Math.round(pct)}% utilizado</p>
    </div>
  );
}

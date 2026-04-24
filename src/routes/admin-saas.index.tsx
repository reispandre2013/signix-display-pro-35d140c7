import { createFileRoute } from "@tanstack/react-router";
import { Building2, CreditCard, DollarSign, TrendingUp, Users, AlertTriangle, Tv, Receipt } from "lucide-react";
import { KpiCard } from "@/components/ui-kit/KpiCard";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { MOCK_SAAS_METRICS, MOCK_RECENT_PAYMENTS, MOCK_SAAS_CLIENTS, MOCK_SAAS_LOGS } from "@/lib/saas-mock";
import { formatPrice } from "@/types/saas";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/admin-saas/")({
  head: () => ({ meta: [{ title: "Visão geral SaaS — Signix" }] }),
  component: SaasOverview,
});

function SaasOverview() {
  const m = MOCK_SAAS_METRICS;

  const mrrSeries = Array.from({ length: 12 }).map((_, i) => {
    const d = subDays(new Date(), (11 - i) * 30);
    const base = m.mrr_cents / 100;
    return {
      mes: format(d, "MMM", { locale: ptBR }),
      mrr: Math.round(base * (0.62 + i * 0.035)),
      novos: Math.round(8 + i * 1.2 + (i % 3)),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão geral da plataforma"
        subtitle="Métricas consolidadas de toda a operação SaaS."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Empresas/clientes" value={m.total_companies} icon={Building2} tone="primary" />
        <KpiCard label="Assinaturas ativas" value={m.active_subscriptions} icon={CreditCard} tone="success" hint={`${m.expired_subscriptions} vencidas · ${m.canceled_subscriptions} canceladas`} />
        <KpiCard label="MRR" value={formatPrice(m.mrr_cents)} icon={DollarSign} tone="info" />
        <KpiCard label="ARR estimado" value={formatPrice(m.arr_cents)} icon={TrendingUp} tone="success" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Novos clientes (30d)" value={m.new_clients_30d} icon={Users} tone="primary" />
        <KpiCard label="Churn" value={`${m.churn_rate}%`} icon={TrendingUp} tone="warning" />
        <KpiCard label="Faturas vencidas" value={m.overdue_invoices_count} icon={AlertTriangle} tone="destructive" />
        <KpiCard label="Telas ativas no SaaS" value={m.total_active_screens} icon={Tv} tone="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2" title="Receita mensal recorrente (MRR)" description="Últimos 12 meses.">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mrrSeries}>
                <defs>
                  <linearGradient id="mrrG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.19 252)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.68 0.19 252)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.025 252 / 30%)" />
                <XAxis dataKey="mes" stroke="oklch(0.66 0.025 248)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.66 0.025 248)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.022 252)", border: "1px solid oklch(0.28 0.025 252)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="mrr" stroke="oklch(0.68 0.19 252)" strokeWidth={2} fill="url(#mrrG)" name="MRR (R$)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Pagamentos recentes" description="Últimas transações.">
          <ul className="space-y-3 text-sm">
            {MOCK_RECENT_PAYMENTS.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary">
                  <Receipt className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.client}</p>
                  <p className="text-[11px] text-muted-foreground">{p.method}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold font-mono">{formatPrice(p.amount_cents)}</p>
                  <StatusBadge tone={p.status === "paid" ? "success" : "warning"} label={p.status === "paid" ? "Pago" : "Pendente"} withDot={false} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Top clientes" description="Maiores assinaturas ativas.">
          <ul className="divide-y divide-border -my-3">
            {MOCK_SAAS_CLIENTS.slice(0, 5).map((c) => (
              <li key={c.organization_id} className="flex items-center gap-3 py-3">
                <div className="h-9 w-9 rounded-lg bg-info/10 grid place-items-center text-info">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.organization_name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.plan_name} · {c.screens_used}/{c.screens_limit} telas</p>
                </div>
                <StatusBadge tone={c.subscription_status === "active" ? "success" : c.subscription_status === "trialing" ? "info" : "warning"} label={c.subscription_status ?? "—"} withDot={false} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Atividade administrativa" description="Eventos relevantes na plataforma.">
          <ul className="space-y-3 text-sm">
            {MOCK_SAAS_LOGS.map((l) => (
              <li key={l.id} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary pulse-dot" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm"><span className="font-medium">{l.actor}</span> · <span className="text-muted-foreground">{l.action}</span></p>
                  <p className="text-[11px] text-muted-foreground">{l.target}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

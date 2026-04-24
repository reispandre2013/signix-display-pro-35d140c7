import { createFileRoute } from "@tanstack/react-router";
import { Check, Star, Plus, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { useAdminPlansCatalog } from "@/lib/hooks/use-saas-data";
import { formatPrice } from "@/types/saas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin-saas/planos")({
  head: () => ({ meta: [{ title: "Planos — SaaS Signix" }] }),
  component: PlanosPage,
});

function PlanosPage() {
  const { data: plans = [], isLoading, isError, error } = useAdminPlansCatalog();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Planos" subtitle="Catálogo de planos comerciais oferecidos no SaaS." />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Planos" subtitle="Catálogo de planos comerciais oferecidos no SaaS." />
        <Panel>
          <p className="text-sm text-destructive">{error instanceof Error ? error.message : "Falha ao carregar planos."}</p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planos"
        subtitle="Catálogo de planos comerciais oferecidos no SaaS."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
            <Plus className="h-3.5 w-3.5" /> Novo plano
          </button>
        }
      />

      {plans.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">Nenhum plano na base. Crie entradas na tabela <code className="text-xs">plans</code> ou execute as seed/migrations.</p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((p) => (
            <Panel key={p.id} className={cn(p.is_recommended && "ring-2 ring-primary shadow-glow")}>
              <div>
                {p.is_recommended && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider mb-2">
                    <Star className="h-3 w-3" /> Recomendado
                  </span>
                )}
                <h3 className="font-display text-xl font-bold">{p.name}</h3>
                {p.is_active ? null : (
                  <span className="ml-2 text-[10px] font-semibold uppercase text-muted-foreground">Inativo</span>
                )}
                <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                <div className="mt-4">
                  <span className="font-display text-3xl font-bold">{formatPrice(p.price_monthly_cents)}</span>
                  <span className="text-xs text-muted-foreground">/mês</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">ou {formatPrice(p.price_yearly_cents)} /ano</p>

                <ul className="mt-4 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground border-t border-border pt-3">
                  <div>
                    <div className="font-bold text-foreground text-sm">{p.max_screens >= 9999 ? "∞" : p.max_screens}</div>
                    telas
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{p.max_users >= 9999 ? "∞" : p.max_users}</div>
                    users
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{p.max_storage_gb}GB</div>
                    storage
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface transition-smooth"
                >
                  Editar plano
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

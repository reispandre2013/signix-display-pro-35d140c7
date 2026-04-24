import { createFileRoute } from "@tanstack/react-router";
import { Check, Star, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { MOCK_PLANS } from "@/lib/saas-mock";
import { formatPrice } from "@/types/saas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin-saas/planos")({
  head: () => ({ meta: [{ title: "Planos — SaaS Signix" }] }),
  component: PlanosPage,
});

function PlanosPage() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_PLANS.map((p) => (
          <Panel
            key={p.id}
            className={cn(p.is_recommended && "ring-2 ring-primary shadow-glow")}
          >
            <div>
              {p.is_recommended && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider mb-2">
                  <Star className="h-3 w-3" /> Recomendado
                </span>
              )}
              <h3 className="font-display text-xl font-bold">{p.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
              <div className="mt-4">
                <span className="font-display text-3xl font-bold">{formatPrice(p.price_monthly_cents)}</span>
                <span className="text-xs text-muted-foreground">/mês</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                ou {formatPrice(p.price_yearly_cents)} /ano
              </p>

              <ul className="mt-4 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground border-t border-border pt-3">
                <div><div className="font-bold text-foreground text-sm">{p.max_screens >= 9999 ? "∞" : p.max_screens}</div>telas</div>
                <div><div className="font-bold text-foreground text-sm">{p.max_users >= 9999 ? "∞" : p.max_users}</div>users</div>
                <div><div className="font-bold text-foreground text-sm">{p.max_storage_gb}GB</div>storage</div>
              </div>

              <button className="mt-4 w-full rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface transition-smooth">
                Editar plano
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

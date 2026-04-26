import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Star, Sparkles, ArrowRight, Tv, Loader2, Lock } from "lucide-react";
import { usePublicPlans } from "@/lib/hooks/use-saas-data";
import { formatPrice } from "@/types/saas";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos — Signix Digital Signage" },
      { name: "description", content: "Escolha o plano ideal para sua operação de digital signage. Telas, usuários e armazenamento sob medida." },
      { property: "og:title", content: "Planos — Signix Digital Signage" },
      { property: "og:description", content: "Escolha o plano ideal para sua operação de digital signage." },
    ],
  }),
  component: PlanosPublic,
});

function PlanosPublic() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const { data: plans, isLoading, isError, error } = usePublicPlans();
  const list = plans ?? [];

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
              <Tv className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Signix</span>
          </Link>
          <Link to="/login" className="text-sm font-medium hover:text-primary">Entrar</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> Preços simples
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight mt-4">
            Escolha o plano ideal para sua operação
          </h1>
          <p className="mt-4 text-muted-foreground">
            Comece grátis por 14 dias. Sem cartão, sem compromisso. Faça upgrade quando quiser.
          </p>

          <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <button
              onClick={() => setCycle("monthly")}
              className={cn("px-4 py-1.5 text-xs font-semibold rounded-full transition-smooth", cycle === "monthly" && "bg-primary text-primary-foreground")}
            >
              Mensal
            </button>
            <button
              onClick={() => setCycle("yearly")}
              className={cn("px-4 py-1.5 text-xs font-semibold rounded-full transition-smooth", cycle === "yearly" && "bg-primary text-primary-foreground")}
            >
              Anual <span className="text-[10px] opacity-80">−16%</span>
            </button>
          </div>
        </div>

        {isError && (
          <p className="mt-8 text-center text-sm text-destructive" role="alert">
            {error instanceof Error ? error.message : "Não foi possível carregar os planos. Verifique a ligação e as migrations SaaS."}
          </p>
        )}

        {isLoading ? (
          <div className="mt-12 flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {list.length === 0 && !isError ? (
            <p className="col-span-full text-center text-sm text-muted-foreground py-8">
              Nenhum plano publicado. Configure planos ativos no Supabase (tabela <code className="text-xs">public.plans</code>).
            </p>
          ) : null}
          {list.map((p) => {
            const price = cycle === "monthly" ? p.price_monthly_cents : Math.round(p.price_yearly_cents / 12);
            return (
              <div
                key={p.id}
                className={cn(
                  "relative rounded-2xl border bg-card p-6 shadow-card",
                  p.is_recommended ? "border-primary ring-2 ring-primary shadow-glow" : "border-border",
                )}
              >
                {p.is_recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-primary text-primary-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-glow">
                    <Star className="h-3 w-3" /> Mais popular
                  </span>
                )}
                <h3 className="font-display text-xl font-bold">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{p.description}</p>

                <div className="mt-5">
                  <span className="font-display text-4xl font-bold">{formatPrice(price)}</span>
                  <span className="text-xs text-muted-foreground">/mês</span>
                  {cycle === "yearly" && (
                    <p className="text-[11px] text-success font-semibold mt-1">Cobrado {formatPrice(p.price_yearly_cents)}/ano</p>
                  )}
                </div>

                <Link
                  to="/checkout"
                  search={{ plan: p.code, cycle }}
                  className={cn(
                    "mt-5 w-full inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-smooth",
                    p.is_recommended
                      ? "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                      : "border border-border hover:bg-surface",
                  )}
                >
                  Contratar <ArrowRight className="h-4 w-4" />
                </Link>

                <ul className="mt-5 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground border-t border-border pt-4">
                  <div><div className="font-bold text-foreground text-sm">{p.max_screens >= 9999 ? "∞" : p.max_screens}</div>telas</div>
                  <div><div className="font-bold text-foreground text-sm">{p.max_users >= 9999 ? "∞" : p.max_users}</div>usuários</div>
                  <div><div className="font-bold text-foreground text-sm">{p.max_storage_gb}GB</div>storage</div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        <section className="mt-16 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center">Perguntas frequentes</h2>
          <div className="mt-6 space-y-3">
            {[
              { q: "Posso trocar de plano depois?", a: "Sim, você pode fazer upgrade ou downgrade a qualquer momento. A cobrança é prorrateada." },
              { q: "Como funciona o trial?", a: "14 dias grátis no plano Professional, sem cartão de crédito. Ao final, escolha um plano para continuar." },
              { q: "Quais formas de pagamento?", a: "Cartão de crédito, PIX e boleto bancário (anual)." },
              { q: "Existe taxa de setup?", a: "Não. Você só paga o valor do plano escolhido." },
            ].map((f) => (
              <details key={f.q} className="rounded-lg border border-border bg-card px-4 py-3 group">
                <summary className="cursor-pointer text-sm font-semibold list-none flex items-center justify-between">
                  {f.q}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Signix · Digital Signage SaaS
        </div>
      </footer>
    </div>
  );
}

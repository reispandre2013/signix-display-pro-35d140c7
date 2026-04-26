import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Tv, ArrowLeft, ShieldCheck, CreditCard, Tag, Loader2 } from "lucide-react";
import { usePlanByCode } from "@/lib/hooks/use-saas-data";
import { formatPrice } from "@/types/saas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { hasSupabaseConfig as isSupabaseConfigured } from "@/lib/supabase-client";
import { useServerFn } from "@tanstack/react-start";
import { createCheckoutSession } from "@/lib/server/saas.functions";

interface CheckoutSearch {
  plan?: string;
  cycle?: "monthly" | "yearly";
}

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Signix" }] }),
  validateSearch: (s: Record<string, unknown>): CheckoutSearch => ({
    plan: typeof s.plan === "string" ? s.plan : undefined,
    cycle: s.cycle === "yearly" ? "yearly" : "monthly",
  }),
  component: CheckoutPage,
});

type CreateCheckoutData = {
  id?: string;
  checkout_url?: string | null;
  message?: string;
  error?: string;
  provider?: string;
  asaas_subscription_id?: string;
};

function methodToAsaas(
  m: "card" | "pix" | "boleto",
): "UNDEFINED" | "CREDIT_CARD" | "PIX" | "BOLETO" {
  if (m === "card") return "CREDIT_CARD";
  if (m === "pix") return "PIX";
  return "BOLETO";
}

function CheckoutPage() {
  const search = Route.useSearch();
  const planQ = usePlanByCode(search.plan);
  const plan = planQ.data;
  const cycle = search.cycle ?? "monthly";
  const { session, loading: authLoading } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");

  const amount = plan
    ? cycle === "monthly"
      ? plan.price_monthly_cents
      : plan.price_yearly_cents
    : 0;

  const [coupon, setCoupon] = useState("");
  const createCheckoutSessionFn = useServerFn(createCheckoutSession);
  const [method, setMethod] = useState<"card" | "pix" | "boleto">("card");
  const [loading, setLoading] = useState(false);
  const discount = coupon.trim().toLowerCase() === "signix10" ? Math.round(amount * 0.1) : 0;
  const total = amount - discount;

  const loginRedirect = `/checkout?plan=${encodeURIComponent(search.plan ?? "")}&cycle=${cycle}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      toast.error("Supabase não configurado neste ambiente.");
      return;
    }
    if (!plan) return;
    if (!session) {
      toast.error(
        "Inicie sessão para concluir o pedido e registar a sessão de checkout no servidor.",
      );
      return;
    }
    const docDigits = cpfCnpj.replace(/\D/g, "");
    if (docDigits.length !== 11 && docDigits.length !== 14) {
      toast.error(
        "Informe CPF (11) ou CNPJ (14) dígitos — obrigatório para a integração com o Asaas.",
      );
      return;
    }
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");

      const data = (await createCheckoutSessionFn({
        data: {
          plan_id: plan.id,
          company_name: companyName.trim() || undefined,
          buyer_email: session.user.email ?? undefined,
          cpf_cnpj: docDigits,
          billing_cycle: cycle,
          billing_type_asaas: methodToAsaas(method),
        },
        headers: { Authorization: `Bearer ${token}` },
      })) as CreateCheckoutData;

      if (data.error) {
        toast.error(data.error);
        return;
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      toast.success(
        data.message ??
          `Pedido de checkout ${data.provider === "asaas" ? "Asaas" : ""} criado.`.trim(),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao iniciar checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (planQ.isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  if (!plan) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-6 text-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Plano não encontrado. Volte e escolha outro plano.
          </p>
          <Link to="/planos" className="mt-3 inline-block text-primary text-sm">
            Ver planos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/planos" className="flex items-center gap-2 text-sm hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Voltar para planos
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
              <Tv className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Signix</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {!authLoading && !session && (
          <div className="lg:col-span-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground/90">
            <Link
              to="/login"
              search={{ redirect: loginRedirect }}
              className="font-medium text-primary underline"
            >
              Inicie sessão
            </Link>{" "}
            para concluir o pedido. O registo cria a sessão de checkout no Supabase (Edge Function)
            com o teu utilizador.
          </div>
        )}

        <form id="form-checkout" onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display font-semibold">Dados do comprador</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Nome completo" required />
              <Field label="Email" type="email" required />
              <Field
                label="CPF/CNPJ"
                required
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                inputMode="numeric"
                autoComplete="off"
                placeholder="Somente números"
              />
              <Field label="Telefone" required />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display font-semibold">Empresa</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label="Razão social"
                required
                className="md:col-span-2"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                autoComplete="organization"
              />
              <Field label="Cidade" required />
              <Field label="Estado" required />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display font-semibold">Forma de pagamento</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(["card", "pix", "boleto"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={cn(
                    "rounded-lg border px-3 py-3 text-xs font-semibold uppercase tracking-wider transition-smooth",
                    method === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-surface",
                  )}
                >
                  {m === "card" ? "Cartão" : m === "pix" ? "PIX" : "Boleto"}
                </button>
              ))}
            </div>
            {method === "card" && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  label="Número do cartão"
                  placeholder="0000 0000 0000 0000"
                  className="md:col-span-2"
                />
                <Field label="Validade" placeholder="MM/AA" />
                <Field label="CVV" placeholder="000" />
              </div>
            )}
            {method === "pix" && (
              <p className="mt-4 text-xs text-muted-foreground">
                Após confirmar, você receberá o QR Code por email.
              </p>
            )}
            {method === "boleto" && (
              <p className="mt-4 text-xs text-muted-foreground">
                Disponível apenas para o ciclo anual.
              </p>
            )}
          </section>
        </form>

        <aside className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 sticky top-6">
            <h2 className="font-display font-semibold">Resumo do pedido</h2>
            <div className="mt-4 rounded-lg border border-border bg-surface p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-gradient-primary grid place-items-center text-primary-foreground">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Plano {plan.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {cycle === "monthly" ? "Cobrança mensal" : "Cobrança anual"}
                </p>
              </div>
              <p className="font-mono font-bold text-sm">{formatPrice(amount)}</p>
            </div>

            <div className="mt-4">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" /> Cupom
              </label>
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Ex: SIGNIX10"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {discount > 0 && (
                <p className="mt-1 text-[11px] text-success">
                  Cupom aplicado: −{formatPrice(discount)}
                </p>
              )}
            </div>

            <div className="mt-4 space-y-1.5 text-sm border-t border-border pt-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(amount)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Desconto</span>
                  <span className="font-mono">−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span className="font-mono">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="form-checkout"
              disabled={loading || !session}
              className="mt-5 w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {session ? "Confirmar e registar pedido" : "Inicie sessão para continuar"}
            </button>
            <p className="mt-3 text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Sessão autenticada com Supabase; gateway de
              pagamento em produção fica ligado no backend.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <input
        {...rest}
        required={required}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}

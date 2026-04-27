import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Reconciliação manual de pagamentos Asaas.
 *
 * Quando o webhook do Asaas não chega (config errada, evento falhou),
 * este endpoint busca a checkout_session pendente mais recente do utilizador,
 * lista os pagamentos da subscription no Asaas e reenvia cada evento ao
 * payment-webhook (mesma lógica idempotente — não duplica subscription/licence/invoice).
 */

const FALLBACK_SUPABASE_URL = "https://auhwylnhqmdgphsvjszr.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1aHd5bG5ocW1kZ3Boc3Zqc3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTcxNTQsImV4cCI6MjA5MTg3MzE1NH0.NNHIM43GJyOYYSjgZX3F1o5Pk_WrEx8xYzIrZpJt3kw";

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((import.meta as any).env?.VITE_SUPABASE_URL as string | undefined) ??
  FALLBACK_SUPABASE_URL;

const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  FALLBACK_ANON_KEY;

type AsaasPayment = {
  id: string;
  value?: number;
  netValue?: number;
  status?: string;
  billingType?: string;
  subscription?: string | null;
  customer?: string;
  description?: string;
  externalReference?: string | null;
  dateCreated?: string;
  confirmedDate?: string;
  dueDate?: string | null;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  paymentDate?: string | null;
  creditDate?: string | null;
};

type ReconcileResult = {
  ok: boolean;
  message: string;
  checkout_id?: string;
  asaas_subscription_id?: string;
  payments_found?: number;
  events_dispatched?: number;
  already_synced?: number;
  errors?: string[];
};

function asaasEventForStatus(status: string): string | null {
  const s = status.toUpperCase();
  if (s === "RECEIVED" || s === "RECEIVED_IN_CASH" || s === "DUNNING_RECEIVED") {
    return "PAYMENT_RECEIVED";
  }
  if (s === "CONFIRMED") return "PAYMENT_CONFIRMED";
  if (s === "OVERDUE") return "PAYMENT_OVERDUE";
  if (s === "REFUNDED" || s === "CHARGEBACK") return "PAYMENT_REFUNDED";
  return null;
}

export const reconcileAsaasPayments = createServerFn({ method: "POST" }).handler(
  async (): Promise<ReconcileResult> => {
    const authHeader = getRequestHeader("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return { ok: false, message: "Não autenticado." };
    }

    // Resolve org via JWT do utilizador (RLS).
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: u, error: uErr } = await userClient.auth.getUser();
    if (uErr || !u.user) {
      return { ok: false, message: "Sessão inválida." };
    }

    const { data: prof } = await userClient
      .from("profiles")
      .select("organization_id")
      .eq("auth_user_id", u.user.id)
      .maybeSingle();
    const orgId = (prof as { organization_id?: string } | null)?.organization_id;
    if (!orgId) {
      return { ok: false, message: "Perfil sem organização." };
    }

    // Pega a checkout_session mais recente com Asaas subscription id.
    const { data: cs } = await supabaseAdmin
      .from("checkout_sessions")
      .select("id, external_checkout_id, plan_id, status, billing_cycle")
      .eq("organization_id", orgId)
      .eq("payment_provider", "asaas")
      .not("external_checkout_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const subId = (cs as { external_checkout_id?: string } | null)?.external_checkout_id;
    if (!cs || !subId) {
      return {
        ok: false,
        message:
          "Nenhuma sessão de checkout Asaas encontrada para esta organização. Crie um checkout primeiro em /planos.",
      };
    }

    // Chama a Asaas via Edge Function dedicada (mantém ASAAS_API_KEY no servidor).
    // Aqui usamos uma rota interna: o create-checkout-session já tem a lógica;
    // criamos um endpoint admin novo via service-role chamando direto o Asaas.
    // Como não queremos duplicar credenciais, expomos isto via Edge Function `asaas-list-payments`
    // — mas para simplificar, chamamos a API Asaas a partir daqui usando a env do worker,
    // com fallback de erro claro.
    const asaasKey = process.env.ASAAS_API_KEY?.trim();
    const asaasBase =
      (process.env.ASAAS_API_BASE?.trim() || "").replace(/\/$/, "") ||
      ((process.env.ASAAS_ENV ?? "").toLowerCase() === "production"
        ? "https://api.asaas.com"
        : "https://api-sandbox.asaas.com");

    if (!asaasKey) {
      return {
        ok: false,
        message: "ASAAS_API_KEY não configurada no servidor. Configure em Lovable Cloud → Secrets.",
        checkout_id: cs.id as string,
        asaas_subscription_id: subId,
      };
    }

    let payments: AsaasPayment[] = [];
    try {
      const r = await fetch(
        `${asaasBase}/v3/subscriptions/${encodeURIComponent(subId)}/payments?limit=20&offset=0`,
        { method: "GET", headers: { access_token: asaasKey } },
      );
      const text = await r.text();
      if (!r.ok) {
        return {
          ok: false,
          message: `Asaas respondeu ${r.status}: ${text.slice(0, 200)}`,
          checkout_id: cs.id as string,
          asaas_subscription_id: subId,
        };
      }
      const parsed = JSON.parse(text || "{}") as { data?: AsaasPayment[] };
      payments = parsed.data ?? [];
    } catch (e) {
      return {
        ok: false,
        message: `Erro ao consultar Asaas: ${e instanceof Error ? e.message : String(e)}`,
        checkout_id: cs.id as string,
        asaas_subscription_id: subId,
      };
    }

    if (payments.length === 0) {
      return {
        ok: true,
        message:
          "Nenhum pagamento encontrado no Asaas para esta subscription ainda. Aguarde o cliente concluir o pagamento.",
        checkout_id: cs.id as string,
        asaas_subscription_id: subId,
        payments_found: 0,
        events_dispatched: 0,
      };
    }

    // Para cada pagamento, despacha o evento equivalente para o payment-webhook.
    const errors: string[] = [];
    let dispatched = 0;
    let alreadySynced = 0;

    for (const pay of payments) {
      const event = asaasEventForStatus(pay.status ?? "");
      if (!event) continue;

      const { data: existingPayment } = await supabaseAdmin
        .from("payments")
        .select("id")
        .eq("payment_provider", "asaas")
        .eq("external_payment_id", pay.id)
        .maybeSingle();

      if (existingPayment) {
        alreadySynced++;
        continue;
      }

      const body = {
        id: `manual-reconcile-${pay.id}-${Date.now()}`,
        event,
        payment: { ...pay, subscription: pay.subscription ?? subId },
      };

      try {
        const webhookUrl = `${SUPABASE_URL}/functions/v1/payment-webhook`;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
        };
        const asaasToken = process.env.ASAAS_WEBHOOK_TOKEN?.trim();
        if (asaasToken) headers["asaas-access-token"] = asaasToken;
        const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET?.trim();
        if (webhookSecret) headers["x-webhook-secret"] = webhookSecret;

        const r = await fetch(webhookUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        const txt = await r.text();
        if (!r.ok) {
          errors.push(`pagto ${pay.id}: HTTP ${r.status} ${txt.slice(0, 120)}`);
        } else {
          dispatched++;
        }
      } catch (e) {
        errors.push(`pagto ${pay.id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return {
      ok: errors.length === 0,
      message:
        errors.length === 0
          ? alreadySynced > 0 && dispatched === 0
            ? `${alreadySynced} pagamento(s) já estavam sincronizados. Nenhuma ação necessária.`
            : `${dispatched} evento(s) sincronizado(s) com sucesso${alreadySynced > 0 ? `; ${alreadySynced} já estavam sincronizados` : ""}. Recarregue a página para ver as alterações.`
          : `${dispatched} sincronizado(s), ${errors.length} com erro.`,
      checkout_id: cs.id as string,
      asaas_subscription_id: subId,
      payments_found: payments.length,
      events_dispatched: dispatched,
      already_synced: alreadySynced,
      errors: errors.length ? errors : undefined,
    };
  },
);

/**
 * Valida ASAAS_API_KEY/ASAAS_API_BASE chamando a Edge Function
 * `validate-asaas-config`. Use antes de qualquer fluxo de sincronização.
 */
export type AsaasValidationResult = {
  ok: boolean;
  environment: "sandbox" | "production" | "unknown";
  base_url: string;
  base_url_source?: "ASAAS_API_BASE" | "ASAAS_ENV" | "default";
  key_prefix: string | null;
  key_set: boolean;
  account?: string | null;
  suggested_base_url?: string;
  message: string;
  details?: string;
};

export const validateAsaasConfig = createServerFn({ method: "POST" }).handler(
  async (): Promise<AsaasValidationResult> => {
    const authHeader = getRequestHeader("authorization") ?? "";
    const url = `${SUPABASE_URL}/functions/v1/validate-asaas-config`;
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: authHeader || `Bearer ${ANON_KEY}`,
        },
        body: "{}",
      });
      const text = await r.text();
      try {
        return JSON.parse(text) as AsaasValidationResult;
      } catch {
        return {
          ok: false,
          environment: "unknown",
          base_url: "",
          key_prefix: null,
          key_set: false,
          message: `Resposta inválida da função (HTTP ${r.status}).`,
          details: text.slice(0, 300),
        };
      }
    } catch (e) {
      return {
        ok: false,
        environment: "unknown",
        base_url: "",
        key_prefix: null,
        key_set: false,
        message: "Falha ao chamar validate-asaas-config.",
        details: e instanceof Error ? e.message : String(e),
      };
    }
  },
);

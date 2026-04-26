import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { adminClient } from "../_shared/client.ts";
import { readJson } from "../_shared/http.ts";
import {
  asaasJson,
  getAsaasConfig,
  isValidCpfCnpj,
  onlyDigits,
  type AsaasPaymentList,
} from "../_shared/asaas.ts";

const cors: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Body = {
  plan_id?: string;
  buyer_email?: string;
  company_name?: string;
  /** CPF (11) ou CNPJ (14) — obrigatório no Asaas para criar cliente. */
  cpf_cnpj?: string;
  /** Ciclo de preço (plano) — mensal vs anual. */
  billing_cycle?: "monthly" | "yearly";
  /** UNDEFINED: cliente escolhe boleto/cartão/PIX no carnê Asaas. */
  billing_type_asaas?: "UNDEFINED" | "BOLETO" | "CREDIT_CARD" | "PIX";
};

type PlanRow = {
  id: string;
  name: string;
  code: string;
  price_monthly_cents: number;
  price_yearly_cents: number;
  is_active: boolean;
};

function tomorrowYmd(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

async function resolveInvoiceUrlForSubscription(asaasSubId: string): Promise<string | null> {
  for (let i = 0; i < 6; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 700));
    const list = await asaasJson<AsaasPaymentList>(
      `/v3/subscriptions/${asaasSubId}/payments?limit=10&offset=0`,
      { method: "GET" },
    );
    const p = list.data?.[0];
    if (p) {
      if (p.invoiceUrl) return p.invoiceUrl;
      if (p.bankSlipUrl) return p.bankSlipUrl;
    }
  }
  return null;
}

/**
 * 1) Sem ASAAS_API_KEY: mantém stub (dev local).
 * 2) Com Asaas: cria/persiste `cus_` em `organizations`, cria assinatura no Asaas, devolve `checkout_url` (carnê) quando existir.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });
  }
  try {
    return await handle(req);
  } catch (e) {
    console.error("[create-checkout-session] uncaught", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno inesperado" }),
      { status: 500, headers: cors },
    );
  }
});

async function handle(req: Request): Promise<Response> {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!url || !anon) {
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), { status: 500, headers: cors });
  }
  const auth = req.headers.get("Authorization");
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: cors });
  }
  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401, headers: cors });
  }

  let body: Body;
  try {
    body = await readJson<Body>(req);
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Body inválido" }),
      { status: 400, headers: cors },
    );
  }
  if (!body.plan_id) {
    return new Response(JSON.stringify({ error: "plan_id required" }), { status: 400, headers: cors });
  }

  const { enabled: asaasOn } = getAsaasConfig();
  if (!asaasOn) {
    const { data: row, error } = await adminClient
      .from("checkout_sessions")
      .insert({
        plan_id: body.plan_id,
        buyer_email: body.buyer_email ?? u.user.email,
        company_name: body.company_name,
        status: "pending",
        payment_provider: "stub",
      })
      .select("id")
      .single();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
    }
    return new Response(
      JSON.stringify({
        id: row?.id,
        checkout_url: null,
        message:
          "Defina ASAAS_API_KEY (e opcionalmente ASAAS_API_BASE) no projeto Supabase para criar assinaturas reais no Asaas.",
        provider: "stub",
      }),
      { status: 200, headers: cors },
    );
  }

  const doc = onlyDigits(body.cpf_cnpj ?? "");
  if (!isValidCpfCnpj(doc)) {
    return new Response(
      JSON.stringify({
        error: "cpf_cnpj é obrigatório e deve ter 11 (CPF) ou 14 (CNPJ) dígitos numéricos (Asaas).",
      }),
      { status: 400, headers: cors },
    );
  }

  const billingCycle = body.billing_cycle === "yearly" ? "yearly" : "monthly";
  const bt = body.billing_type_asaas ?? "UNDEFINED";

  const { data: prof, error: pErr } = await adminClient
    .from("profiles")
    .select("id, name, email, organization_id")
    .eq("auth_user_id", u.user.id)
    .maybeSingle();
  if (pErr || !prof?.organization_id) {
    return new Response(
      JSON.stringify({ error: "Perfil sem organização. Crie/associa uma organização ao utilizador." }),
      { status: 400, headers: cors },
    );
  }
  const orgId = prof.organization_id as string;

  const { data: plan, error: plErr } = await adminClient
    .from("plans")
    .select("id, name, code, price_monthly_cents, price_yearly_cents, is_active")
    .eq("id", body.plan_id)
    .maybeSingle();
  if (plErr || !plan) {
    return new Response(JSON.stringify({ error: "Plano não encontrado" }), { status: 400, headers: cors });
  }
  const p = plan as PlanRow;
  if (!p.is_active) {
    return new Response(JSON.stringify({ error: "Plano inativo" }), { status: 400, headers: cors });
  }

  const amountCents =
    billingCycle === "yearly" ? Number(p.price_yearly_cents) : Number(p.price_monthly_cents);
  if (!Number.isFinite(amountCents) || amountCents < 0) {
    return new Response(JSON.stringify({ error: "Valor de plano inválido" }), { status: 400, headers: cors });
  }
  const valueBrl = Number((amountCents / 100).toFixed(2));

  const { data: org, error: oErr } = await adminClient
    .from("organizations")
    .select("id, name, asaas_customer_id")
    .eq("id", orgId)
    .maybeSingle();
  if (oErr || !org) {
    return new Response(JSON.stringify({ error: "Organização não encontrada" }), { status: 400, headers: cors });
  }

  const { data: sessionRow, error: csErr } = await adminClient
    .from("checkout_sessions")
    .insert({
      plan_id: p.id,
      organization_id: orgId,
      buyer_name: (prof as { name?: string }).name ?? u.user.user_metadata?.full_name,
      buyer_email: body.buyer_email ?? u.user.email,
      company_name: body.company_name ?? (org as { name?: string }).name,
      company_document: doc,
      billing_cycle: billingCycle,
      status: "pending",
      payment_provider: "asaas",
    })
    .select("id")
    .single();
  if (csErr) {
    return new Response(JSON.stringify({ error: csErr.message }), { status: 500, headers: cors });
  }
  const checkoutId = sessionRow.id as string;

  let cus = (org as { asaas_customer_id?: string | null }).asaas_customer_id;
  if (!cus) {
    const customerBody = {
      name: (body.company_name ?? (org as { name?: string }).name ?? (prof as { name?: string }).name ?? "Signix")
        .toString()
        .slice(0, 200),
      email: (body.buyer_email ?? u.user.email ?? (prof as { email?: string }).email ?? "")?.toString(),
      cpfCnpj: doc,
      externalReference: orgId,
    };
    let cusR: { id: string };
    try {
      cusR = await asaasJson<{ id: string }>("/v3/customers", {
        method: "POST",
        body: JSON.stringify(customerBody),
      });
    } catch (e) {
      await adminClient
        .from("checkout_sessions")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", checkoutId);
      return new Response(
        JSON.stringify({ error: "Asaas (customer): " + (e instanceof Error ? e.message : String(e)) }),
        { status: 502, headers: cors },
      );
    }
    cus = cusR.id;
    const { error: upOrg } = await adminClient
      .from("organizations")
      .update({ asaas_customer_id: cus })
      .eq("id", orgId);
    if (upOrg) {
      return new Response(JSON.stringify({ error: "Falha a gravar asaas_customer_id: " + upOrg.message }), {
        status: 500,
        headers: cors,
      });
    }
  }

  const asaasCycle = billingCycle === "yearly" ? "YEARLY" : "MONTHLY";
  const subBody = {
    customer: cus,
    billingType: bt,
    value: valueBrl,
    nextDueDate: tomorrowYmd(),
    cycle: asaasCycle,
    description: `Signix — ${p.name}`,
    externalReference: checkoutId,
  };

  let sub: { id: string };
  try {
    sub = await asaasJson<{ id: string }>("/v3/subscriptions", {
      method: "POST",
      body: JSON.stringify(subBody),
    });
  } catch (e) {
    await adminClient
      .from("checkout_sessions")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", checkoutId);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro Asaas" }),
      { status: 502, headers: cors },
    );
  }

  let invoiceUrl: string | null = null;
  try {
    invoiceUrl = await resolveInvoiceUrlForSubscription(sub.id);
  } catch (e) {
    console.warn("[create-checkout-session] resolveInvoiceUrl falhou:", e);
  }
  const { error: upCs } = await adminClient
    .from("checkout_sessions")
    .update({
      external_checkout_id: sub.id,
      checkout_url: invoiceUrl,
      status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", checkoutId);
  if (upCs) {
    return new Response(JSON.stringify({ error: upCs.message, subscription_id: sub.id }), { status: 200, headers: cors });
  }

  return new Response(
    JSON.stringify({
      id: checkoutId,
      checkout_url: invoiceUrl,
      asaas_subscription_id: sub.id,
      message: invoiceUrl
        ? "Abra a URL para finalizar a forma de pagamento no Asaas (boleto, cartão ou PIX, conforme disponível)."
        : "Assinatura criada no Asaas. A cobrança pode levar instantes; consulte a área de cobranças no Asaas ou o e-mail enviado ao cliente.",
      provider: "asaas",
    }),
    { status: 200, headers: cors },
  );
}


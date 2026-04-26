import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

/** Mesma ordem que `web-player.functions.ts` — em Workers/Vite, `VITE_*` pode vir só de `import.meta.env`. */
const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((import.meta as any).env?.VITE_SUPABASE_URL as string | undefined) ??
  "";
const ANON =
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  "";

/**
 * Contexto SaaS do utilizador autenticado (perfil, org, assinatura, plano, licença, uso).
 * Usa RLS com JWT do cliente — não expõe service role.
 */
export const getUserSaasContext = createServerFn({ method: "POST" }).handler(async () => {
  if (!SUPABASE_URL || !ANON) {
    throw new Error("Configuração Supabase incompleta no servidor.");
  }
  const authHeader = getRequestHeader("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Não autenticado.");

  const userClient = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await userClient.rpc("get_user_saas_context");
  if (error) throw new Error(error.message);
  return (data ?? null) as JsonValue;
});

type CheckoutInput = {
  plan_id: string;
  company_name?: string;
  buyer_email?: string;
  cpf_cnpj: string;
  billing_cycle?: "monthly" | "yearly";
  billing_type_asaas?: "UNDEFINED" | "CREDIT_CARD" | "PIX" | "BOLETO";
};

/**
 * Proxy server-side para create-checkout-session.
 * Evita erro de rede do browser ao chamar Edge Function diretamente e mantém
 * o mesmo contrato de resposta para a UI.
 */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): CheckoutInput => {
    if (!input || typeof input !== "object") throw new Error("Payload inválido.");
    const o = input as Record<string, unknown>;
    if (typeof o.plan_id !== "string" || !o.plan_id.trim()) throw new Error("plan_id obrigatório.");
    if (typeof o.cpf_cnpj !== "string" || !o.cpf_cnpj.trim()) throw new Error("cpf_cnpj obrigatório.");
    return {
      plan_id: o.plan_id.trim(),
      company_name: typeof o.company_name === "string" ? o.company_name : undefined,
      buyer_email: typeof o.buyer_email === "string" ? o.buyer_email : undefined,
      cpf_cnpj: o.cpf_cnpj.trim(),
      billing_cycle: o.billing_cycle === "yearly" ? "yearly" : "monthly",
      billing_type_asaas:
        o.billing_type_asaas === "BOLETO" ||
        o.billing_type_asaas === "CREDIT_CARD" ||
        o.billing_type_asaas === "PIX" ||
        o.billing_type_asaas === "UNDEFINED"
          ? o.billing_type_asaas
          : "UNDEFINED",
    };
  })
  .handler(async ({ data }) => {
    if (!SUPABASE_URL || !ANON) {
      throw new Error("Configuração Supabase incompleta no servidor.");
    }
    const authHeader = getRequestHeader("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Não autenticado.");

    const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const parsed = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const edgeMsg = typeof parsed.error === "string" ? parsed.error : null;
      throw new Error(edgeMsg ?? "Falha ao criar checkout no servidor.");
    }
    return parsed as JsonValue;
  });

/**
 * Valida se ASAAS_API_KEY e ASAAS_API_BASE estão coerentes (sandbox vs produção)
 * antes de qualquer fluxo de sincronização. Faz um GET em /v3/myAccount com a
 * configuração atual e detecta o erro clássico
 *   "A chave de API utilizada não pertence a este ambiente"
 *
 * Resposta:
 * {
 *   ok: boolean,
 *   environment: "sandbox" | "production" | "unknown",
 *   base_url: string,
 *   key_prefix: string | null,
 *   key_set: boolean,
 *   suggested_base_url?: string,
 *   message: string,
 *   details?: string,
 * }
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
};

const SANDBOX_BASE = "https://api-sandbox.asaas.com";
const PRODUCTION_BASE = "https://api.asaas.com";

function resolveBaseUrl(): { url: string; source: "ASAAS_API_BASE" | "ASAAS_ENV" | "default" } {
  const explicit = (Deno.env.get("ASAAS_API_BASE") ?? "").trim();
  if (explicit) return { url: explicit.replace(/\/$/, ""), source: "ASAAS_API_BASE" };
  const mode = (Deno.env.get("ASAAS_ENV") ?? Deno.env.get("ASAAS_API_ENV") ?? "")
    .trim()
    .toLowerCase();
  if (mode === "production" || mode === "prod" || mode === "live") {
    return { url: PRODUCTION_BASE, source: "ASAAS_ENV" };
  }
  return { url: SANDBOX_BASE, source: "default" };
}

function classifyBase(url: string): "sandbox" | "production" | "unknown" {
  if (url.includes("sandbox")) return "sandbox";
  if (url === PRODUCTION_BASE || url === "https://api.asaas.com") return "production";
  return "unknown";
}

function isEnvMismatch(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("não pertence a este ambiente") ||
    t.includes("does not belong to this environment")
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const apiKey = (Deno.env.get("ASAAS_API_KEY") ?? "").trim();
  const { url: baseUrl, source } = resolveBaseUrl();
  const env = classifyBase(baseUrl);
  const keyPrefix = apiKey ? apiKey.slice(0, 10) + "…" : null;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        environment: env,
        base_url: baseUrl,
        base_url_source: source,
        key_prefix: null,
        key_set: false,
        message:
          "ASAAS_API_KEY não está configurada. Defina o secret nas Edge Functions do Supabase.",
      }),
      { status: 200, headers: cors },
    );
  }

  // Probe leve: /v3/myAccount devolve dados da conta (e revela o ambiente).
  let status = 0;
  let body = "";
  try {
    const r = await fetch(`${baseUrl}/v3/myAccount`, {
      method: "GET",
      headers: { access_token: apiKey, Accept: "application/json" },
    });
    status = r.status;
    body = await r.text();
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        environment: env,
        base_url: baseUrl,
        base_url_source: source,
        key_prefix: keyPrefix,
        key_set: true,
        message: "Falha de rede ao contactar o Asaas.",
        details: e instanceof Error ? e.message : String(e),
      }),
      { status: 200, headers: cors },
    );
  }

  // 401 → chave inválida (ou pertence a outro ambiente)
  if (status === 401) {
    const mismatch = isEnvMismatch(body);
    const suggested = env === "sandbox" ? PRODUCTION_BASE : SANDBOX_BASE;
    return new Response(
      JSON.stringify({
        ok: false,
        environment: env,
        base_url: baseUrl,
        base_url_source: source,
        key_prefix: keyPrefix,
        key_set: true,
        suggested_base_url: mismatch ? suggested : undefined,
        message: mismatch
          ? `A chave configurada não pertence a ${env === "sandbox" ? "sandbox" : "produção"}. Tente ASAAS_API_BASE = ${suggested}.`
          : "ASAAS_API_KEY inválida (HTTP 401). Verifique a chave em Asaas → Integrações → API Key.",
        details: body.slice(0, 400),
      }),
      { status: 200, headers: cors },
    );
  }

  if (status < 200 || status >= 300) {
    return new Response(
      JSON.stringify({
        ok: false,
        environment: env,
        base_url: baseUrl,
        base_url_source: source,
        key_prefix: keyPrefix,
        key_set: true,
        message: `Asaas respondeu HTTP ${status} ao validar a conta.`,
        details: body.slice(0, 400),
      }),
      { status: 200, headers: cors },
    );
  }

  // 2xx → tudo coerente
  let accountName: string | undefined;
  try {
    const j = JSON.parse(body) as { name?: string; email?: string; walletId?: string };
    accountName = j.name ?? j.email ?? j.walletId;
  } catch {
    /* ignore */
  }

  return new Response(
    JSON.stringify({
      ok: true,
      environment: env,
      base_url: baseUrl,
      base_url_source: source,
      key_prefix: keyPrefix,
      key_set: true,
      account: accountName ?? null,
      message: `Conta Asaas validada (${env}).`,
    }),
    { status: 200, headers: cors },
  );
});

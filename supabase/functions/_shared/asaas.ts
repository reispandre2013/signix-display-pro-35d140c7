/**
 * Cliente mínimo para API v3 do Asaas (https://api.asaas.com / api-sandbox.asaas.com).
 * Autenticação: header `access_token` (ver documentação).
 */

const DEFAULT_BASE = "https://api-sandbox.asaas.com";

export function getAsaasConfig(): { apiKey: string; baseUrl: string; enabled: boolean } {
  const apiKey = (Deno.env.get("ASAAS_API_KEY") ?? "").trim();
  const baseUrl = (Deno.env.get("ASAAS_API_BASE") ?? DEFAULT_BASE).replace(/\/$/, "");
  return { apiKey, baseUrl, enabled: apiKey.length > 0 };
}

type AsaasErrorResponse = { errors?: { description?: string; code?: string }[] };

export class AsaasApiError extends Error {
  status: number;
  body: string;
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "AsaasApiError";
    this.status = status;
    this.body = body;
  }
}

export async function asaasJson<T>(path: string, init: RequestInit & { method?: string } = {}): Promise<T> {
  const { apiKey, baseUrl, enabled } = getAsaasConfig();
  if (!enabled) {
    throw new Error("ASAAS_API_KEY não configurada.");
  }
  const url = path.startsWith("http") ? path : `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  const h = new Headers(init.headers ?? undefined);
  h.set("access_token", apiKey);
  if (init.body != null && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }
  const r = await fetch(url, { ...init, headers: h });
  const text = await r.text();
  if (!r.ok) {
    let msg = r.statusText;
    try {
      const j = JSON.parse(text) as AsaasErrorResponse;
      if (j.errors?.length) {
        msg = j.errors.map((e) => e.description).filter(Boolean).join("; ") || msg;
      }
    } catch {
      if (text) msg = text.slice(0, 200);
    }
    throw new AsaasApiError(msg, r.status, text);
  }
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export type AsaasCustomer = { id: string; object?: string; email?: string };
export type AsaasSubscription = { id: string; object?: string; customer: string; value: number; cycle: string };
export type AsaasPaymentList = { object?: string; data: AsaasPaymentItem[]; hasMore?: boolean };
export type AsaasPaymentItem = {
  id: string;
  object?: string;
  value: number;
  status: string;
  subscription?: string;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  pix?: { encodedImage?: string; payload?: string; expirationDate?: string } | null;
  customer: string;
};

export function reaisToCents(value: number): number {
  return Math.round(value * 100);
}

export function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

export function isValidCpfCnpj(d: string): boolean {
  if (d.length === 11 || d.length === 14) return true;
  return false;
}

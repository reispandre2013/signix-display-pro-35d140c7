import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FALLBACK_SUPABASE_URL = "https://auhwylnhqmdgphsvjszr.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  FALLBACK_SUPABASE_ANON_KEY;

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken(size = 48): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  const arr = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < arr.length; i += 1) out += chars[arr[i] % chars.length];
  return out;
}

function browserFromUserAgent(ua: string): { name: string; version: string } {
  const checks: Array<{ key: string; rx: RegExp }> = [
    { key: "Edge", rx: /Edg\/([\d.]+)/i },
    { key: "Chrome", rx: /Chrome\/([\d.]+)/i },
    { key: "Firefox", rx: /Firefox\/([\d.]+)/i },
    { key: "Safari", rx: /Version\/([\d.]+).*Safari/i },
  ];
  for (const c of checks) {
    const m = (ua || "").match(c.rx);
    if (m?.[1]) return { name: c.key, version: m[1] };
  }
  return { name: "Unknown", version: "" };
}

function fnUrl(name: string) {
  if (!SUPABASE_URL) throw new Error("SUPABASE_URL ausente.");
  return `${SUPABASE_URL}/functions/v1/${name}`;
}

// Edge function responses are opaque JSON; we return `any` so TanStack's
// serialization validator accepts it and callers can read fields freely.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function invokeEdge<TReq extends object>(name: string, payload: TReq): Promise<any> {
  if (!ANON_KEY) throw new Error("SUPABASE_ANON_KEY ausente.");
  const response = await fetch(fnUrl(name), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  const parsed = (await response.json()) as { error?: string } & Record<string, unknown>;
  if (!response.ok || parsed.error) {
    throw new Error(parsed.error ?? `Falha em ${name}`);
  }
  return parsed;
}

export const createWebPairingCode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = (typeof input === "object" && input ? input : {}) as Record<string, unknown>;
    return {
      screen_name: typeof o.screen_name === "string" ? o.screen_name : "Web Player",
      organization_id: typeof o.organization_id === "string" ? o.organization_id : null,
    };
  })
  .handler(async ({ data }) => invokeEdge("create-web-pairing-code", data));

export const validateWebPairing = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Payload inválido.");
    const o = input as Record<string, unknown>;
    if (typeof o.pairing_code !== "string" || !o.pairing_code.trim()) {
      throw new Error("Código obrigatório.");
    }
    return {
      pairing_code: o.pairing_code,
      fingerprint: typeof o.fingerprint === "string" ? o.fingerprint : "",
      user_agent: typeof o.user_agent === "string" ? o.user_agent : "",
      screen_width: typeof o.screen_width === "number" ? o.screen_width : null,
      screen_height: typeof o.screen_height === "number" ? o.screen_height : null,
    };
  })
  .handler(async ({ data }) => invokeEdge("validate-web-pairing", data));

export const activateWebPlayer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Payload inválido.");
    const o = input as Record<string, unknown>;
    if (typeof o.screen_id !== "string" || typeof o.device_token !== "string") {
      throw new Error("screen_id e device_token obrigatórios.");
    }
    return { screen_id: o.screen_id, device_token: o.device_token };
  })
  .handler(async ({ data }) => invokeEdge("activate-web-player", data));

export const webPlayerSync = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Payload inválido.");
    const o = input as Record<string, unknown>;
    if (typeof o.screen_id !== "string" && typeof o.display_token !== "string") {
      throw new Error("screen_id ou display_token obrigatório.");
    }
    if (typeof o.device_token !== "string" && typeof o.display_token !== "string") {
      throw new Error("device_token ou display_token obrigatório.");
    }
    return {
      screen_id: typeof o.screen_id === "string" ? o.screen_id : undefined,
      display_token: typeof o.display_token === "string" ? o.display_token : undefined,
      device_token: typeof o.device_token === "string" ? o.device_token : undefined,
      etag: typeof o.etag === "string" ? o.etag : null,
    };
  })
  .handler(async ({ data }) => invokeEdge("web-player-sync", data));

export const webPlayerHeartbeat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Payload inválido.");
    const o = input as Record<string, unknown>;
    if (typeof o.screen_id !== "string" || typeof o.device_token !== "string") {
      throw new Error("screen_id e device_token obrigatórios.");
    }
    return o;
  })
  .handler(async ({ data }) => invokeEdge("web-player-heartbeat", data as Record<string, unknown>));

export const registerWebPlaybackLog = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Payload inválido.");
    return input as Record<string, unknown>;
  })
  .handler(async ({ data }) => invokeEdge("register-playback-log", data));

export const revokeWebPlayerSession = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Payload inválido.");
    const o = input as Record<string, unknown>;
    if (typeof o.screen_id !== "string") throw new Error("screen_id obrigatório.");
    return { screen_id: o.screen_id };
  })
  .handler(async ({ data }) => {
    const auth = getRequestHeader("authorization");
    if (!auth) {
      // Mantém a intenção de uso administrativo; auth real é no app antes do botão ficar acessível.
    }
    return invokeEdge("revoke-player-session", data);
  });

export const refreshWebPlayerToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Payload inválido.");
    const o = input as Record<string, unknown>;
    if (typeof o.screen_id !== "string" || typeof o.device_token !== "string") {
      throw new Error("screen_id e device_token obrigatórios.");
    }
    return { screen_id: o.screen_id, device_token: o.device_token };
  })
  .handler(async ({ data }) => invokeEdge("refresh-player-token", data));

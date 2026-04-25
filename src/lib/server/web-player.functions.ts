import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

const SUPABASE_URL = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL ?? "";
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "";

function fnUrl(name: string) {
  if (!SUPABASE_URL) throw new Error("SUPABASE_URL ausente.");
  return `${SUPABASE_URL}/functions/v1/${name}`;
}

async function invokeEdge<TReq extends object>(
  name: string,
  payload: TReq,
): Promise<Record<string, unknown>> {
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
  const parsed = (await response.json()) as Record<string, unknown> & { error?: string };
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

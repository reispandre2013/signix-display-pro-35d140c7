import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getRuntimeSupabaseAnonKey, getRuntimeSupabaseUrl } from "@/lib/runtime-config";

/**
 * Cliente Supabase central. Usa a chave publicável (publishable/anon) — nunca service_role no browser.
 *
 * Ordem de resolução:
 * 1. Runtime config (localStorage) — preenchido pelo usuário em /configurar
 * 2. Variáveis de build (VITE_SUPABASE_*)
 */
export function getSupabaseUrl(): string | undefined {
  const runtime = getRuntimeSupabaseUrl();
  if (runtime) return runtime;
  const url = import.meta.env.VITE_SUPABASE_URL;
  return typeof url === "string" && url.length > 0 ? url : undefined;
}

/** Chave pública: aceita VITE_SUPABASE_PUBLISHABLE_KEY ou legado VITE_SUPABASE_ANON_KEY (Lovable/preview). */
export function getSupabasePublishableKey(): string | undefined {
  const runtime = getRuntimeSupabaseAnonKey();
  if (runtime) return runtime;
  const pub = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const key =
    typeof pub === "string" && pub.length > 0
      ? pub
      : typeof anon === "string" && anon.length > 0
        ? anon
        : undefined;
  return key;
}

export function getSupabaseProjectId(): string | undefined {
  const id = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  return typeof id === "string" && id.length > 0 ? id : undefined;
}

/**
 * Computado dinamicamente para refletir runtime config aplicada após o load.
 * NOTA: imports antigos que leem `hasSupabaseEnv` como booleano estático continuam
 * funcionando, mas o valor reflete apenas o estado no momento do bundle inicial.
 * Prefira `hasSupabaseConfig()` para checks pós-mount.
 */
export function hasSupabaseConfig(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export const hasSupabaseEnv = hasSupabaseConfig();

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!hasSupabaseEnv) return null;
  if (_client) return _client;
  const url = getSupabaseUrl()!;
  const key = getSupabasePublishableKey()!;
  _client = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}

/** Alias estável para importações que esperam `supabase` singular. */
export const supabase = getSupabase();

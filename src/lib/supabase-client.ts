import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getRuntimeSupabaseAnonKey, getRuntimeSupabaseUrl } from "@/lib/runtime-config";

/**
 * Cliente Supabase central. Usa a chave publicável (publishable/anon) — nunca service_role no browser.
 *
 * Ordem de resolução:
 * 1. Runtime config (localStorage) — preenchido pelo usuário em /configurar
 * 2. Variáveis de build (VITE_SUPABASE_*)
 * 3. Fallback hardcoded (anon key é pública por design; segurança vem da RLS)
 */
const FALLBACK_SUPABASE_URL = "https://auhwylnhqmdgphsvjszr.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1aHd5bG5ocW1kZ3Boc3Zqc3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTcxNTQsImV4cCI6MjA5MTg3MzE1NH0.NNHIM43GJyOYYSjgZX3F1o5Pk_WrEx8xYzIrZpJt3kw";

export function getSupabaseUrl(): string | undefined {
  const runtime = getRuntimeSupabaseUrl();
  if (runtime) return runtime;
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (typeof url === "string" && url.length > 0) return url;
  return FALLBACK_SUPABASE_URL;
}

/** Chave pública: aceita VITE_SUPABASE_PUBLISHABLE_KEY ou legado VITE_SUPABASE_ANON_KEY (Lovable/preview). */
export function getSupabasePublishableKey(): string | undefined {
  const runtime = getRuntimeSupabaseAnonKey();
  if (runtime) return runtime;
  const pub = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (typeof pub === "string" && pub.length > 0) return pub;
  if (typeof anon === "string" && anon.length > 0) return anon;
  return FALLBACK_SUPABASE_ANON_KEY;
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

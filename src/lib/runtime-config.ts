/**
 * Runtime config para Supabase: permite preencher URL e ANON KEY pelo navegador
 * (localStorage), funcionando como fallback quando as envs `VITE_SUPABASE_*` não
 * foram injetadas no build (ex.: preview Lovable sem Build Secrets).
 *
 * SSR-safe: todas as funções verificam `window` antes de acessar localStorage.
 */

const STORAGE_KEYS = {
  url: "signix.runtime.supabase_url",
  key: "signix.runtime.supabase_anon_key",
} as const;

function safeGet(key: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const v = window.localStorage.getItem(key);
    return v && v.length > 0 ? v : undefined;
  } catch {
    return undefined;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function safeRemove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function getRuntimeSupabaseUrl(): string | undefined {
  return safeGet(STORAGE_KEYS.url);
}

export function getRuntimeSupabaseAnonKey(): string | undefined {
  return safeGet(STORAGE_KEYS.key);
}

export function setRuntimeSupabaseConfig(url: string, anonKey: string): void {
  safeSet(STORAGE_KEYS.url, url.trim());
  safeSet(STORAGE_KEYS.key, anonKey.trim());
}

export function clearRuntimeSupabaseConfig(): void {
  safeRemove(STORAGE_KEYS.url);
  safeRemove(STORAGE_KEYS.key);
}

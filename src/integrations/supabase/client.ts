import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase-client";

/** Mesma regra que `lib/supabase-client`: URL + publishable OU anon (Lovable costuma expor só publishable). */
const RESOLVED_URL = getSupabaseUrl();
const RESOLVED_KEY = getSupabasePublishableKey();

if (!RESOLVED_URL || !RESOLVED_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    "[Supabase] Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (ou VITE_SUPABASE_ANON_KEY) no .env.",
  );
}

// Fallbacks com URL/JWT sintaticamente válidos para evitar crash no SSR quando as envs
// não estão presentes no runtime do servidor (ex.: preview sem secrets injetados).
// Qualquer chamada de rede falhará explicitamente, mas o módulo carrega sem derrubar a página.
const SUPABASE_URL = RESOLVED_URL ?? "https://placeholder.supabase.co";
const SUPABASE_KEY =
  RESOLVED_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsInJlZiI6InBsYWNlaG9sZGVyIiwiaWF0IjowLCJleHAiOjB9.placeholder";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

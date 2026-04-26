// SERVER-ONLY. Nunca importar em código de cliente.
// Usa a service role key para bypassar RLS em operações admin.
import { createClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://auhwylnhqmdgphsvjszr.supabase.co";

// URL pode vir de várias fontes dependendo de como o Worker do TanStack
// expõe variáveis em runtime. Mantemos uma cadeia robusta com fallback final.
const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  // import.meta.env é estático em build, mas seguro de ler aqui (server only).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((import.meta as any).env?.VITE_SUPABASE_URL as string | undefined) ??
  FALLBACK_SUPABASE_URL;

const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    "[supabaseAdmin] SERVICE_ROLE_KEY ausente no ambiente do servidor. Operações admin irão falhar.",
  );
}

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY ?? "", {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Re-exporta o cliente Supabase singleton de `lib/supabase-client`.
 *
 * Antes este arquivo criava um SEGUNDO cliente, o que disparava o aviso
 * "Multiple GoTrueClient instances detected in the same browser context"
 * e podia gerar comportamento indefinido na sessão de auth.
 *
 * Mantemos o caminho `@/integrations/supabase/client` para retrocompatibilidade
 * dos imports existentes, mas todos apontam para a MESMA instância.
 */
export {
  supabase,
  getSupabase,
  getSupabaseUrl,
  getSupabasePublishableKey,
  getSupabaseProjectId,
  hasSupabaseConfig,
  hasSupabaseEnv,
} from "@/lib/supabase-client";

import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const ANON =
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  "";

/**
 * Contexto SaaS do utilizador autenticado (perfil, org, assinatura, plano, licença, uso).
 * Usa RLS com JWT do cliente — não expõe service role.
 */
export const getUserSaasContext = createServerFn({ method: "POST" }).handler(async () => {
  if (!SUPABASE_URL || !ANON) {
    throw new Error("Configuração Supabase incompleta no servidor.");
  }
  const authHeader = getRequestHeader("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Não autenticado.");

  const userClient = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await userClient.rpc("get_user_saas_context");
  if (error) throw new Error(error.message);
  return data as Record<string, unknown>;
});

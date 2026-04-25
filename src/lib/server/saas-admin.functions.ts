import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://auhwylnhqmdgphsvjszr.supabase.co";

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_SUPABASE_URL ??
  FALLBACK_SUPABASE_URL;

const ANON =
  process.env.SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_SUPABASE_ANON_KEY ??
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "";

const SERVICE_ROLE =
  process.env.SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function mustEnv() {
  if (!SUPABASE_URL) throw new Error("Configuração Supabase incompleta no servidor (URL ausente).");
  if (!SERVICE_ROLE) throw new Error("SERVICE_ROLE_KEY ausente no ambiente do servidor.");
  // ANON é opcional para operações admin; só falha se também precisar autenticar usuário
}

async function getAuthedUser() {
  const authHeader = getRequestHeader("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Não autenticado.");
  // Usa service role para validar o token sem depender da ANON key no servidor
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data.user) throw new Error("Sessão inválida.");
  return data.user;
}

type JsonSafe =
  | string | number | boolean | null
  | JsonSafe[]
  | { [k: string]: JsonSafe };

export type SaasDiagnosticsResult = {
  user: { id: string; email: string | null };
  profile: {
    id: string | null;
    email: string | null;
    role: string | null;
    organization_id: string | null;
  } | null;
  isSuperAdmin: boolean;
  counts: Record<string, number | { error: string }>;
  samples: Record<string, JsonSafe[]>;
  envOk: boolean;
};

const COUNT_TABLES = [
  "plans",
  "organizations",
  "profiles",
  "subscriptions",
  "invoices",
  "licenses",
  "user_roles",
  "audit_logs",
] as const;

/** Diagnóstico completo: identifica o usuário, role e mede saúde das tabelas SaaS via service role. */
export const getSaasDiagnostics = createServerFn({ method: "POST" }).handler(
  async (): Promise<SaasDiagnosticsResult> => {
    mustEnv();
    const user = await getAuthedUser();
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: profile } = await admin
      .from("profiles")
      .select("id,email,role,organization_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isSuperAdmin =
      (profile?.role === "super_admin") ||
      (roles ?? []).some((r) => r.role === "super_admin");

    const counts: SaasDiagnosticsResult["counts"] = {};
    const samples: SaasDiagnosticsResult["samples"] = {};

    await Promise.all(
      COUNT_TABLES.map(async (t) => {
        const { count, error } = await admin
          .from(t)
          .select("*", { count: "exact", head: true });
        if (error) {
          counts[t] = { error: error.message };
        } else {
          counts[t] = count ?? 0;
        }
        if (!error) {
          const { data } = await admin.from(t).select("*").limit(2);
          samples[t] = (data ?? []) as JsonSafe[];
        }
      }),
    );

    return {
      user: { id: user.id, email: user.email ?? null },
      profile: profile
        ? {
            id: (profile as { id?: string | null }).id ?? null,
            email: (profile as { email?: string | null }).email ?? null,
            role: (profile as { role?: string | null }).role ?? null,
            organization_id:
              (profile as { organization_id?: string | null }).organization_id ?? null,
          }
        : null,
      isSuperAdmin,
      counts,
      samples,
      envOk: true,
    };
  },
);

/** Promove o usuário autenticado a super_admin (insere em user_roles e atualiza profiles.role). */
export const promoteSelfToSuperAdmin = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: true; role: "super_admin" }> => {
    mustEnv();
    const user = await getAuthedUser();
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1) user_roles (idempotente via unique constraint user_id+role)
    const { error: rolesErr } = await admin
      .from("user_roles")
      .upsert({ user_id: user.id, role: "super_admin" }, { onConflict: "user_id,role" });
    if (rolesErr && !/duplicate|unique/i.test(rolesErr.message)) {
      throw new Error(`user_roles: ${rolesErr.message}`);
    }

    // 2) profiles.role (best-effort — pode não existir ainda)
    const { data: prof } = await admin
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (prof?.id) {
      const { error: profErr } = await admin
        .from("profiles")
        .update({ role: "super_admin" })
        .eq("id", prof.id);
      if (profErr) throw new Error(`profiles.update: ${profErr.message}`);
    } else {
      // cria perfil mínimo para o usuário se ainda não existir
      const { error: insErr } = await admin.from("profiles").insert({
        auth_user_id: user.id,
        email: user.email ?? null,
        role: "super_admin",
        name: user.email?.split("@")[0] ?? "Super Admin",
      });
      if (insErr && !/duplicate|unique/i.test(insErr.message)) {
        throw new Error(`profiles.insert: ${insErr.message}`);
      }
    }

    return { ok: true, role: "super_admin" };
  },
);

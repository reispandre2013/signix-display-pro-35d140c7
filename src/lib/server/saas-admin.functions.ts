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

// ============================================================================
// Plans CRUD (super_admin)
// ============================================================================

export type PlanUpsertInput = {
  id?: string | null;
  code: string;
  name: string;
  description?: string | null;
  price_monthly_cents: number;
  price_yearly_cents: number;
  currency?: string;
  max_screens: number;
  max_users: number;
  max_storage_gb: number;
  features: string[];
  support_level?: string | null;
  is_recommended: boolean;
  is_active: boolean;
  sort_order: number;
};

async function assertSuperAdmin(admin: ReturnType<typeof createClient>, userId: string) {
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("auth_user_id", userId)
    .maybeSingle();
  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const ok =
    (profile as { role?: string } | null)?.role === "super_admin" ||
    (roles ?? []).some((r) => (r as { role?: string }).role === "super_admin");
  if (!ok) throw new Error("Acesso restrito a super_admin.");
}

/** Cria ou atualiza um plano. */
export const upsertPlan = createServerFn({ method: "POST" })
  .inputValidator((input: PlanUpsertInput) => {
    if (!input.code || !input.name) throw new Error("Código e nome são obrigatórios.");
    if (!Number.isFinite(input.price_monthly_cents) || input.price_monthly_cents < 0)
      throw new Error("Preço mensal inválido.");
    if (!Number.isFinite(input.price_yearly_cents) || input.price_yearly_cents < 0)
      throw new Error("Preço anual inválido.");
    return input;
  })
  .handler(async ({ data }): Promise<{ ok: true; id: string }> => {
    mustEnv();
    const user = await getAuthedUser();
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await assertSuperAdmin(admin, user.id);

    const payload = {
      code: data.code.trim(),
      name: data.name.trim(),
      description: data.description ?? null,
      price_monthly_cents: Math.round(data.price_monthly_cents),
      price_yearly_cents: Math.round(data.price_yearly_cents),
      currency: data.currency ?? "BRL",
      max_screens: Math.round(data.max_screens),
      max_users: Math.round(data.max_users),
      max_storage_gb: Math.round(data.max_storage_gb),
      features: data.features ?? [],
      support_level: data.support_level ?? null,
      is_recommended: !!data.is_recommended,
      is_active: !!data.is_active,
      sort_order: Math.round(data.sort_order),
    };

    if (data.id) {
      const { data: row, error } = await admin
        .from("plans")
        .update(payload)
        .eq("id", data.id)
        .select("id")
        .single();
      if (error) throw new Error(`plans.update: ${error.message}`);
      return { ok: true, id: (row as { id: string }).id };
    }

    const { data: row, error } = await admin
      .from("plans")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(`plans.insert: ${error.message}`);
    return { ok: true, id: (row as { id: string }).id };
  });

/** Remove um plano. */
export const deletePlan = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("id obrigatório.");
    return input;
  })
  .handler(async ({ data }): Promise<{ ok: true }> => {
    mustEnv();
    const user = await getAuthedUser();
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await assertSuperAdmin(admin, user.id);
    const { error } = await admin.from("plans").delete().eq("id", data.id);
    if (error) throw new Error(`plans.delete: ${error.message}`);
    return { ok: true };
  });

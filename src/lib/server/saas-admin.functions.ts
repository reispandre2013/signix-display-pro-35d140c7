import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

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
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_SUPABASE_ANON_KEY ??
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "";

const SERVICE_ROLE = process.env.SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

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

type JsonSafe = string | number | boolean | null | JsonSafe[] | { [k: string]: JsonSafe };

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

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);

    const isSuperAdmin =
      profile?.role === "super_admin" || (roles ?? []).some((r) => r.role === "super_admin");

    const counts: SaasDiagnosticsResult["counts"] = {};
    const samples: SaasDiagnosticsResult["samples"] = {};

    await Promise.all(
      COUNT_TABLES.map(async (t) => {
        const { count, error } = await admin.from(t).select("*", { count: "exact", head: true });
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
  max_storage_mb?: number;
  max_storage_gb: number;
  features: string[];
  support_level?: string | null;
  is_recommended: boolean;
  is_active: boolean;
  sort_order: number;
};

async function assertSuperAdmin(admin: SupabaseClient, userId: string) {
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("auth_user_id", userId)
    .maybeSingle();
  const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId);
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

    const resolvedStorageMb = Number.isFinite(data.max_storage_mb)
      ? Math.max(0, Math.round(Number(data.max_storage_mb)))
      : Number.isFinite(data.max_storage_gb)
        ? Math.max(0, Math.round(Number(data.max_storage_gb) * 1000))
        : 0;
    const legacyStorageGbInt =
      resolvedStorageMb > 0 ? Math.max(1, Math.ceil(resolvedStorageMb / 1000)) : 0;

    const payload = {
      code: data.code.trim(),
      name: data.name.trim(),
      description: data.description ?? null,
      price_monthly_cents: Math.round(data.price_monthly_cents),
      price_yearly_cents: Math.round(data.price_yearly_cents),
      currency: data.currency ?? "BRL",
      max_screens: Math.round(data.max_screens),
      max_users: Math.round(data.max_users),
      max_storage_mb: resolvedStorageMb,
      max_storage_gb: legacyStorageGbInt,
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

    const { data: row, error } = await admin.from("plans").insert(payload).select("id").single();
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

// ============================================================================
// Admin Master provisioning (super_admin only)
// ============================================================================

export type OrgOption = { id: string; name: string; slug: string };

/** Lista organizações para popular o seletor do criador de admin_master. */
export const listOrganizationsForAdmin = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ organizations: OrgOption[] }> => {
    mustEnv();
    const user = await getAuthedUser();
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await assertSuperAdmin(admin, user.id);
    const { data, error } = await admin
      .from("organizations")
      .select("id,name,slug")
      .order("name", { ascending: true });
    if (error) throw new Error(`organizations.list: ${error.message}`);
    return { organizations: (data ?? []) as OrgOption[] };
  },
);

export type CreateAdminMasterInput = {
  email: string;
  password: string;
  name: string;
  organization_id: string;
};

/** Cria um usuário admin_master vinculado a uma organização existente. */
export const createAdminMaster = createServerFn({ method: "POST" })
  .inputValidator((input: CreateAdminMasterInput) => {
    if (!input?.email || !/^\S+@\S+\.\S+$/.test(input.email)) throw new Error("Email inválido.");
    if (!input?.password || input.password.length < 8)
      throw new Error("Senha precisa ter ao menos 8 caracteres.");
    if (!input?.name || input.name.trim().length < 2) throw new Error("Nome obrigatório.");
    if (!input?.organization_id) throw new Error("Organização obrigatória.");
    return input;
  })
  .handler(
    async ({
      data,
    }): Promise<{
      ok: true;
      user_id: string;
      profile_id: string | null;
      organization_id: string;
    }> => {
      mustEnv();
      const caller = await getAuthedUser();
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      await assertSuperAdmin(admin, caller.id);

      // Valida organização
      const { data: org, error: orgErr } = await admin
        .from("organizations")
        .select("id,name")
        .eq("id", data.organization_id)
        .maybeSingle();
      if (orgErr) throw new Error(`organizations.get: ${orgErr.message}`);
      if (!org) throw new Error("Organização não encontrada.");

      // 1) Cria (ou recupera) o usuário no auth
      let userId: string | null = null;
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { name: data.name },
      });
      if (createErr) {
        // Se já existir, busca pelo email via listUsers (paginado, busca primeira página suficiente)
        if (/already|exists|registered|duplicate/i.test(createErr.message)) {
          const { data: list, error: listErr } = await admin.auth.admin.listUsers({
            page: 1,
            perPage: 200,
          });
          if (listErr) throw new Error(`auth.listUsers: ${listErr.message}`);
          const existing = list.users.find(
            (u) => u.email?.toLowerCase() === data.email.toLowerCase(),
          );
          if (!existing) throw new Error(`auth.createUser: ${createErr.message}`);
          userId = existing.id;
          // Atualiza a senha para a informada (super_admin solicitou)
          const { error: updErr } = await admin.auth.admin.updateUserById(existing.id, {
            password: data.password,
            email_confirm: true,
          });
          if (updErr) throw new Error(`auth.updateUser: ${updErr.message}`);
        } else {
          throw new Error(`auth.createUser: ${createErr.message}`);
        }
      } else {
        userId = created.user?.id ?? null;
      }
      if (!userId) throw new Error("Não foi possível obter user_id.");

      // 2) Profile (upsert por auth_user_id)
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("auth_user_id", userId)
        .maybeSingle();

      let profileId: string | null = (existingProfile as { id?: string } | null)?.id ?? null;

      if (profileId) {
        const { error: updProfErr } = await admin
          .from("profiles")
          .update({
            organization_id: data.organization_id,
            name: data.name,
            email: data.email,
            role: "admin_master",
            status: "active",
          })
          .eq("id", profileId);
        if (updProfErr) throw new Error(`profiles.update: ${updProfErr.message}`);
      } else {
        const { data: insProf, error: insProfErr } = await admin
          .from("profiles")
          .insert({
            auth_user_id: userId,
            organization_id: data.organization_id,
            name: data.name,
            email: data.email,
            role: "admin_master",
            status: "active",
          })
          .select("id")
          .single();
        if (insProfErr) throw new Error(`profiles.insert: ${insProfErr.message}`);
        profileId = (insProf as { id: string }).id;
      }

      // 3) user_roles (com organization_id NOT NULL)
      const { error: roleErr } = await admin.from("user_roles").upsert(
        {
          user_id: userId,
          organization_id: data.organization_id,
          role: "admin_master",
        },
        { onConflict: "user_id,role,organization_id" },
      );
      if (roleErr && !/duplicate|unique/i.test(roleErr.message)) {
        throw new Error(`user_roles: ${roleErr.message}`);
      }

      return {
        ok: true,
        user_id: userId,
        profile_id: profileId,
        organization_id: data.organization_id,
      };
    },
  );

// ============================================================================
// Reconciliação GLOBAL de pagamentos Asaas (super_admin)
// Itera sobre todas as organizações com checkout_session Asaas, lista os
// pagamentos no Asaas e reenvia eventos pendentes ao payment-webhook.
// ============================================================================

type AsaasPaymentLite = {
  id: string;
  status?: string;
  subscription?: string | null;
  value?: number;
  customer?: string;
  dueDate?: string | null;
  paymentDate?: string | null;
  confirmedDate?: string;
};

function asaasEventForStatusGlobal(status: string): string | null {
  const s = (status || "").toUpperCase();
  if (s === "RECEIVED" || s === "RECEIVED_IN_CASH" || s === "DUNNING_RECEIVED")
    return "PAYMENT_RECEIVED";
  if (s === "CONFIRMED") return "PAYMENT_CONFIRMED";
  if (s === "OVERDUE") return "PAYMENT_OVERDUE";
  if (s === "REFUNDED" || s === "CHARGEBACK") return "PAYMENT_REFUNDED";
  return null;
}

export type GlobalAsaasReconcileResult = {
  ok: boolean;
  message: string;
  organizations_checked: number;
  subscriptions_checked: number;
  payments_found: number;
  events_dispatched: number;
  already_synced: number;
  errors: string[];
  per_org?: Array<{
    organization_id: string;
    asaas_subscription_id: string;
    payments_found: number;
    dispatched: number;
    already_synced: number;
    error?: string;
  }>;
};

export const reconcileAllAsaasPayments = createServerFn({ method: "POST" }).handler(
  async (): Promise<GlobalAsaasReconcileResult> => {
    mustEnv();
    const user = await getAuthedUser();
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await assertSuperAdmin(admin, user.id);

    const asaasKey = process.env.ASAAS_API_KEY?.trim();
    const asaasBase =
      (process.env.ASAAS_API_BASE?.trim() || "").replace(/\/$/, "") ||
      ((process.env.ASAAS_ENV ?? "").toLowerCase() === "production"
        ? "https://api.asaas.com"
        : "https://api-sandbox.asaas.com");

    if (!asaasKey) {
      return {
        ok: false,
        message: "ASAAS_API_KEY não configurada no servidor.",
        organizations_checked: 0,
        subscriptions_checked: 0,
        payments_found: 0,
        events_dispatched: 0,
        already_synced: 0,
        errors: ["ASAAS_API_KEY ausente"],
      };
    }

    // Pega a checkout_session mais recente de CADA organização que usa Asaas.
    const { data: sessions, error: sErr } = await admin
      .from("checkout_sessions")
      .select("id, organization_id, external_checkout_id, created_at")
      .eq("payment_provider", "asaas")
      .not("external_checkout_id", "is", null)
      .order("created_at", { ascending: false });

    if (sErr) {
      return {
        ok: false,
        message: `Erro ao listar checkout_sessions: ${sErr.message}`,
        organizations_checked: 0,
        subscriptions_checked: 0,
        payments_found: 0,
        events_dispatched: 0,
        already_synced: 0,
        errors: [sErr.message],
      };
    }

    // Mantém apenas a subscription mais recente por organização
    const latestByOrg = new Map<string, { subId: string; orgId: string }>();
    for (const s of sessions ?? []) {
      const orgId = (s as { organization_id?: string }).organization_id;
      const subId = (s as { external_checkout_id?: string }).external_checkout_id;
      if (!orgId || !subId) continue;
      if (!latestByOrg.has(orgId)) latestByOrg.set(orgId, { subId, orgId });
    }

    const errors: string[] = [];
    const perOrg: GlobalAsaasReconcileResult["per_org"] = [];
    let paymentsFound = 0;
    let dispatchedTotal = 0;
    let alreadyTotal = 0;
    let subsChecked = 0;

    const webhookUrl = `${SUPABASE_URL}/functions/v1/payment-webhook`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (ANON) {
      headers.apikey = ANON;
      headers.Authorization = `Bearer ${ANON}`;
    }
    const asaasToken = process.env.ASAAS_WEBHOOK_TOKEN?.trim();
    if (asaasToken) headers["asaas-access-token"] = asaasToken;
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET?.trim();
    if (webhookSecret) headers["x-webhook-secret"] = webhookSecret;

    for (const { subId, orgId } of latestByOrg.values()) {
      subsChecked++;
      let payments: AsaasPaymentLite[] = [];
      try {
        const r = await fetch(
          `${asaasBase}/v3/subscriptions/${encodeURIComponent(subId)}/payments?limit=50&offset=0`,
          { method: "GET", headers: { access_token: asaasKey } },
        );
        const text = await r.text();
        if (!r.ok) {
          const msg = `org ${orgId} sub ${subId}: HTTP ${r.status} ${text.slice(0, 120)}`;
          errors.push(msg);
          perOrg.push({
            organization_id: orgId,
            asaas_subscription_id: subId,
            payments_found: 0,
            dispatched: 0,
            already_synced: 0,
            error: msg,
          });
          continue;
        }
        const parsed = JSON.parse(text || "{}") as { data?: AsaasPaymentLite[] };
        payments = parsed.data ?? [];
      } catch (e) {
        const msg = `org ${orgId} sub ${subId}: ${e instanceof Error ? e.message : String(e)}`;
        errors.push(msg);
        perOrg.push({
          organization_id: orgId,
          asaas_subscription_id: subId,
          payments_found: 0,
          dispatched: 0,
          already_synced: 0,
          error: msg,
        });
        continue;
      }

      paymentsFound += payments.length;
      let dispatched = 0;
      let alreadySynced = 0;

      for (const pay of payments) {
        const event = asaasEventForStatusGlobal(pay.status ?? "");
        if (!event) continue;

        const { data: existing } = await admin
          .from("payments")
          .select("id")
          .eq("payment_provider", "asaas")
          .eq("external_payment_id", pay.id)
          .maybeSingle();

        if (existing) {
          alreadySynced++;
          continue;
        }

        const body = {
          id: `admin-global-reconcile-${pay.id}-${Date.now()}`,
          event,
          payment: { ...pay, subscription: pay.subscription ?? subId },
        };

        try {
          const r = await fetch(webhookUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
          });
          const txt = await r.text();
          if (!r.ok) {
            errors.push(`org ${orgId} pagto ${pay.id}: HTTP ${r.status} ${txt.slice(0, 120)}`);
          } else {
            dispatched++;
          }
        } catch (e) {
          errors.push(
            `org ${orgId} pagto ${pay.id}: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }

      dispatchedTotal += dispatched;
      alreadyTotal += alreadySynced;
      perOrg.push({
        organization_id: orgId,
        asaas_subscription_id: subId,
        payments_found: payments.length,
        dispatched,
        already_synced: alreadySynced,
      });
    }

    return {
      ok: errors.length === 0,
      message:
        errors.length === 0
          ? `${subsChecked} subscription(s) verificada(s). ${dispatchedTotal} evento(s) sincronizado(s); ${alreadyTotal} já estavam ok.`
          : `${subsChecked} subscription(s) verificada(s). ${dispatchedTotal} sincronizado(s), ${alreadyTotal} já ok, ${errors.length} erro(s).`,
      organizations_checked: latestByOrg.size,
      subscriptions_checked: subsChecked,
      payments_found: paymentsFound,
      events_dispatched: dispatchedTotal,
      already_synced: alreadyTotal,
      errors,
      per_org: perOrg,
    };
  },
);

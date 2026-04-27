import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Helpers server-side para validar limites do plano contratado antes
 * de criar telas/usuários/mídia. Usa o cliente admin (bypass RLS) para
 * ler `licenses` (limites efetivos) e contar uso real.
 *
 * Regra: se não houver licença `active`/`trial`, bloqueia (sem plano = sem provisão).
 * Super admins / planos sem limite usam `9999` como sentinela "ilimitado".
 */

export interface PlanLimits {
  max_screens: number;
  max_users: number;
  max_storage_mb: number;
}

export async function getOrgPlanLimits(
  admin: SupabaseClient,
  orgId: string,
): Promise<PlanLimits | null> {
  const { data, error } = await admin
    .from("licenses")
    .select("max_screens, max_users, max_storage_mb")
    .eq("organization_id", orgId)
    .in("status", ["trial", "active"])
    .order("valid_from", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("[plan-limits] erro lendo licenses:", error.message);
    return null;
  }
  if (!data) return null;
  return {
    max_screens: Number(data.max_screens ?? 0),
    max_users: Number(data.max_users ?? 0),
    max_storage_mb: Number(data.max_storage_mb ?? 0),
  };
}

export async function countOrgScreens(admin: SupabaseClient, orgId: string): Promise<number> {
  const { count, error } = await admin
    .from("screens")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId);
  if (error) {
    console.warn("[plan-limits] count screens:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function countOrgUsers(admin: SupabaseClient, orgId: string): Promise<number> {
  const { count, error } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .neq("status", "inactive");
  if (error) {
    console.warn("[plan-limits] count users:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function assertCanAddScreen(admin: SupabaseClient, orgId: string): Promise<void> {
  const limits = await getOrgPlanLimits(admin, orgId);
  if (!limits) {
    throw new Error(
      "Sem assinatura ativa. Contrate um plano em /planos para adicionar telas.",
    );
  }
  if (limits.max_screens >= 9999) return;
  const used = await countOrgScreens(admin, orgId);
  if (used >= limits.max_screens) {
    throw new Error(
      `Limite do plano atingido: ${used}/${limits.max_screens} telas. Faça upgrade em /planos.`,
    );
  }
}

export async function assertCanAddUser(admin: SupabaseClient, orgId: string): Promise<void> {
  const limits = await getOrgPlanLimits(admin, orgId);
  if (!limits) {
    throw new Error(
      "Sem assinatura ativa. Contrate um plano em /planos para adicionar usuários.",
    );
  }
  if (limits.max_users >= 9999) return;
  const used = await countOrgUsers(admin, orgId);
  if (used >= limits.max_users) {
    throw new Error(
      `Limite do plano atingido: ${used}/${limits.max_users} usuários. Faça upgrade em /planos.`,
    );
  }
}

import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_SUPABASE_URL ??
  "";

const SERVICE_ROLE = process.env.SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function adminClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE) throw new Error("Configuração Supabase incompleta no servidor.");
  return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
}

async function getAuthedUserId(): Promise<string> {
  const authHeader = getRequestHeader("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Não autenticado.");
  const admin = adminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error("Sessão inválida.");
  return data.user.id;
}

async function getAuthContext(admin: SupabaseClient, userId: string) {
  const { data: profile } = await admin
    .from("profiles")
    .select("role, organization_id")
    .eq("auth_user_id", userId)
    .maybeSingle();
  const { data: roles } = await admin
    .from("user_roles")
    .select("role, organization_id")
    .eq("user_id", userId);
  const profileRole = (profile as { role?: string } | null)?.role;
  const profileOrgId =
    (profile as { organization_id?: string } | null)?.organization_id ?? null;
  const roleRows = (roles ?? []) as Array<{ role?: string; organization_id?: string | null }>;
  const allowedRoles = ["super_admin", "operador", "admin_master", "gestor"];
  const ok =
    (profileRole && allowedRoles.includes(profileRole)) ||
    roleRows.some((r) => r.role && allowedRoles.includes(r.role));
  if (!ok) throw new Error("Acesso restrito.");
  const isSuperAdmin =
    profileRole === "super_admin" || roleRows.some((r) => r.role === "super_admin");
  // Consolida TODAS as organizações às quais o usuário está vinculado
  // (perfil + user_roles). Sem isso, usuários cujo profile.organization_id
  // está nulo ou que pertencem a múltiplas orgs viam "Nenhuma tela".
  const orgSet = new Set<string>();
  if (profileOrgId) orgSet.add(profileOrgId);
  for (const r of roleRows) {
    if (r.organization_id) orgSet.add(r.organization_id);
  }
  const organizationIds = Array.from(orgSet);
  return { isSuperAdmin, organizationIds };
}

async function assertCanManageScreen(admin: SupabaseClient, userId: string, screenOrgId: string) {
  const { isSuperAdmin, organizationIds } = await getAuthContext(admin, userId);
  if (isSuperAdmin) return;
  if (!organizationIds.includes(screenOrgId)) throw new Error("Sem permissão para esta tela.");
}

export type RadioStreamRow = {
  id: string;
  screen_id: string;
  organization_id: string;
  radio_name: string;
  stream_url: string;
  volume: number;
  is_active: boolean;
  updated_at: string;
};

export type ScreenWithRadio = {
  screen_id: string;
  screen_name: string;
  organization_id: string;
  organization_name: string | null;
  radio: RadioStreamRow | null;
};

/** Lista telas com sua rádio (se houver). Super admin vê todas; demais perfis veem apenas a própria org. */
export const listScreensWithRadio = createServerFn({ method: "POST" }).handler(async () => {
  const userId = await getAuthedUserId();
  const admin = adminClient();
  const { isSuperAdmin, organizationIds } = await getAuthContext(admin, userId);

  let query = admin
    .from("screens")
    .select("id, name, organization_id")
    .order("name", { ascending: true });
  if (!isSuperAdmin) {
    if (organizationIds.length === 0) return [] as ScreenWithRadio[];
    query = query.in("organization_id", organizationIds);
  }
  const { data: screens, error: sErr } = await query;
  if (sErr) throw new Error(sErr.message);

  const screenList = (screens ?? []) as Array<{
    id: string;
    name: string;
    organization_id: string;
  }>;

  // Busca nomes das organizações em separado (evita depender de FK embed do PostgREST).
  const orgIds = Array.from(new Set(screenList.map((s) => s.organization_id).filter(Boolean)));
  const orgNameById = new Map<string, string>();
  if (orgIds.length > 0) {
    const { data: orgs, error: oErr } = await admin
      .from("organizations")
      .select("id, name")
      .in("id", orgIds);
    if (oErr) throw new Error(oErr.message);
    for (const o of (orgs ?? []) as Array<{ id: string; name: string | null }>) {
      orgNameById.set(o.id, o.name ?? "");
    }
  }

  let radiosQuery = admin.from("radio_streams").select("*");
  if (!isSuperAdmin && organizationIds.length > 0) {
    radiosQuery = radiosQuery.in("organization_id", organizationIds);
  }
  const { data: radios, error: rErr } = await radiosQuery;
  if (rErr) throw new Error(rErr.message);

  const radioByScreen = new Map<string, RadioStreamRow>();
  for (const r of (radios ?? []) as RadioStreamRow[]) radioByScreen.set(r.screen_id, r);

  const out: ScreenWithRadio[] = screenList.map((s) => ({
    screen_id: s.id,
    screen_name: s.name,
    organization_id: s.organization_id,
    organization_name: orgNameById.get(s.organization_id) ?? null,
    radio: radioByScreen.get(s.id) ?? null,
  }));

  return out;
});

export type UpsertRadioInput = {
  screen_id: string;
  radio_name: string;
  stream_url: string;
  volume: number;
  is_active: boolean;
};

export const upsertRadioStream = createServerFn({ method: "POST" })
  .inputValidator((input: UpsertRadioInput) => {
    if (!input.screen_id) throw new Error("screen_id obrigatório.");
    if (!input.stream_url || !/^https?:\/\//i.test(input.stream_url))
      throw new Error("URL inválida (use http:// ou https://).");
    if (input.stream_url.length > 2000) throw new Error("URL muito longa.");
    if (!input.radio_name || input.radio_name.length > 120)
      throw new Error("Nome da rádio inválido.");
    if (input.volume < 0 || input.volume > 1) throw new Error("Volume entre 0 e 1.");
    return input;
  })
  .handler(async ({ data }) => {
    const userId = await getAuthedUserId();
    const admin = adminClient();

    const { data: screen, error: sErr } = await admin
      .from("screens")
      .select("id, organization_id")
      .eq("id", data.screen_id)
      .maybeSingle();
    if (sErr) throw new Error(sErr.message);
    if (!screen) throw new Error("Tela não encontrada.");
    await assertCanManageScreen(admin, userId, (screen as { organization_id: string }).organization_id);

    const payload = {
      screen_id: data.screen_id,
      organization_id: (screen as { organization_id: string }).organization_id,
      radio_name: data.radio_name.trim(),
      stream_url: data.stream_url.trim(),
      volume: Math.round(data.volume * 100) / 100,
      is_active: data.is_active,
      updated_by: userId,
    };

    const { data: row, error } = await admin
      .from("radio_streams")
      .upsert(payload, { onConflict: "screen_id" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as RadioStreamRow;
  });

export const deleteRadioStream = createServerFn({ method: "POST" })
  .inputValidator((input: { screen_id: string }) => {
    if (!input.screen_id) throw new Error("screen_id obrigatório.");
    return input;
  })
  .handler(async ({ data }) => {
    const userId = await getAuthedUserId();
    const admin = adminClient();
    await assertSuperAdmin(admin, userId);
    const { error } = await admin.from("radio_streams").delete().eq("screen_id", data.screen_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleRadioActive = createServerFn({ method: "POST" })
  .inputValidator((input: { screen_id: string; is_active: boolean }) => input)
  .handler(async ({ data }) => {
    const userId = await getAuthedUserId();
    const admin = adminClient();
    await assertSuperAdmin(admin, userId);
    const { error } = await admin
      .from("radio_streams")
      .update({ is_active: data.is_active, updated_by: userId })
      .eq("screen_id", data.screen_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

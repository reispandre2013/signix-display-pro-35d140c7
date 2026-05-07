import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://auhwylnhqmdgphsvjszr.supabase.co";

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_SUPABASE_URL ??
  FALLBACK_SUPABASE_URL;

const SERVICE_ROLE = process.env.SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function admin(): SupabaseClient {
  if (!SERVICE_ROLE) throw new Error("SERVICE_ROLE_KEY ausente no servidor.");
  return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
}

async function authedUser(): Promise<{ userId: string; client: SupabaseClient }> {
  const authHeader = getRequestHeader("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Não autenticado.");
  const c = admin();
  const { data, error } = await c.auth.getUser(token);
  if (error || !data.user) throw new Error("Sessão inválida.");
  return { userId: data.user.id, client: c };
}

async function resolveOrgs(c: SupabaseClient, userId: string) {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    c.from("profiles").select("role, organization_id").eq("auth_user_id", userId).maybeSingle(),
    c.from("user_roles").select("role, organization_id").eq("user_id", userId),
  ]);
  const profileRole = (profile as { role?: string } | null)?.role;
  const profileOrg = (profile as { organization_id?: string } | null)?.organization_id ?? null;
  const roleRows = (roles ?? []) as Array<{ role?: string; organization_id?: string | null }>;
  const allowed = ["super_admin", "operador", "admin_master", "gestor"];
  const ok = (profileRole && allowed.includes(profileRole)) ||
    roleRows.some((r) => r.role && allowed.includes(r.role));
  if (!ok) throw new Error("Acesso restrito.");
  const isSuper = profileRole === "super_admin" || roleRows.some((r) => r.role === "super_admin");
  const orgs = new Set<string>();
  if (profileOrg) orgs.add(profileOrg);
  for (const r of roleRows) if (r.organization_id) orgs.add(r.organization_id);
  return { isSuper, orgs: Array.from(orgs) };
}

export type PendingAndroidDevice = {
  id: string;
  device_uuid: string;
  device_name: string | null;
  tv_model: string | null;
  manufacturer: string | null;
  app_version: string | null;
  platform: string | null;
  last_seen: string | null;
  created_at: string;
};

export const listPendingAndroidDevices = createServerFn({ method: "POST" }).handler(async () => {
  const { userId, client } = await authedUser();
  await resolveOrgs(client, userId);
  const { data, error } = await client
    .from("player_devices")
    .select("id, device_uuid, device_name, tv_model, manufacturer, app_version, platform, last_seen, created_at")
    .eq("auto_register_status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PendingAndroidDevice[];
});

function genToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

type ActivateInput = {
  device_id: string;
  device_name: string;
  organization_id: string;
  unit_id?: string | null;
};

function validateActivate(input: unknown): ActivateInput {
  if (!input || typeof input !== "object") throw new Error("Payload inválido.");
  const o = input as Record<string, unknown>;
  if (typeof o.device_id !== "string" || !o.device_id) throw new Error("device_id obrigatório.");
  if (typeof o.device_name !== "string" || !o.device_name.trim())
    throw new Error("Nome do dispositivo obrigatório.");
  if (typeof o.organization_id !== "string" || !o.organization_id)
    throw new Error("organization_id obrigatório.");
  return {
    device_id: o.device_id,
    device_name: o.device_name.trim().slice(0, 120),
    organization_id: o.organization_id,
    unit_id: typeof o.unit_id === "string" && o.unit_id ? o.unit_id : null,
  };
}

export const activateAndroidDevice = createServerFn({ method: "POST" })
  .inputValidator(validateActivate)
  .handler(async ({ data }) => {
    const { userId, client } = await authedUser();
    const { isSuper, orgs } = await resolveOrgs(client, userId);
    if (!isSuper && !orgs.includes(data.organization_id)) {
      throw new Error("Sem permissão para esta organização.");
    }

    const { data: dev, error: devErr } = await client
      .from("player_devices")
      .select("id, screen_id, auto_register_status")
      .eq("id", data.device_id)
      .maybeSingle();
    if (devErr) throw new Error(devErr.message);
    if (!dev) throw new Error("Dispositivo não encontrado.");

    let screenId = dev.screen_id as string | null;
    if (!screenId) {
      const insertScreen: Record<string, unknown> = {
        organization_id: data.organization_id,
        name: data.device_name,
        platform: "android",
        is_online: false,
        device_status: "offline",
      };
      if (data.unit_id) insertScreen.unit_id = data.unit_id;
      const { data: created, error: scrErr } = await client
        .from("screens")
        .insert(insertScreen)
        .select("id")
        .single();
      if (scrErr) throw new Error(`Falha ao criar tela: ${scrErr.message}`);
      screenId = created.id as string;
    }

    const token = genToken();
    const hash = await sha256Hex(token);

    const { error: updErr } = await client
      .from("player_devices")
      .update({
        screen_id: screenId,
        device_name: data.device_name,
        organization_id: data.organization_id,
        auto_register_status: "active",
        pairing_status: "active",
        auth_secret_hash: hash,
        auth_issued_at: new Date().toISOString(),
      })
      .eq("id", data.device_id);
    if (updErr) throw new Error(updErr.message);

    return { ok: true, device_id: data.device_id, screen_id: screenId, token };
  });

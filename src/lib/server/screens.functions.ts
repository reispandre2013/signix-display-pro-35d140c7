import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  getPlayerCapabilities,
  normalizePlayerPlatform,
  type PlayerPlatform,
} from "@/lib/platform-capabilities";
import { assertCanAddScreen } from "@/lib/server/plan-limits.server";

const FALLBACK_SUPABASE_URL = "https://auhwylnhqmdgphsvjszr.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1aHd5bG5ocW1kZ3Boc3Zqc3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTcxNTQsImV4cCI6MjA5MTg3MzE1NH0.NNHIM43GJyOYYSjgZX3F1o5Pk_WrEx8xYzIrZpJt3kw";

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  import.meta.env.VITE_SUPABASE_URL ??
  FALLBACK_SUPABASE_URL;
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  FALLBACK_SUPABASE_ANON_KEY;

type Orientation = "landscape" | "portrait";

interface ClaimInput {
  code: string;
  name: string;
  unit_id: string | null;
  orientation: Orientation;
  /** Default `android` se omitido — compatível com clientes antigos. */
  platform: PlayerPlatform;
}

function normalizeCode(raw: string) {
  const compact = raw
    .trim()
    .toUpperCase()
    .replace(/[·•‧]/g, "-")
    .replace(/[‐‑‒–—―_]/g, "-")
    .replace(/\s+/g, "");
  const alnum = compact.replace(/[^A-Z0-9]/g, "");
  if (alnum.length === 8) return `${alnum.slice(0, 4)}-${alnum.slice(4)}`;
  return compact;
}

function toScreenOrientation(orientation: Orientation) {
  return orientation === "landscape" ? "horizontal" : "vertical";
}

function validate(input: unknown): ClaimInput {
  if (typeof input !== "object" || input === null) throw new Error("Payload inválido.");
  const { code, name, unit_id, orientation, platform } = input as Record<string, unknown>;
  if (typeof code !== "string" || normalizeCode(code).length < 6)
    throw new Error("Código de pareamento inválido.");
  if (typeof name !== "string" || name.trim().length < 2)
    throw new Error("Informe um nome para a tela.");
  if (orientation !== "landscape" && orientation !== "portrait")
    throw new Error("Orientação inválida.");
  const plat =
    typeof platform === "string" &&
    (platform === "tizen" || platform === "android" || platform === "web")
      ? (platform as PlayerPlatform)
      : "android";
  return {
    code: normalizeCode(code),
    name: name.trim(),
    unit_id: typeof unit_id === "string" && unit_id.length > 0 ? unit_id : null,
    orientation,
    platform: plat,
  };
}

/**
 * Vincula um código de pareamento (gerado pelo player anônimo) a uma nova
 * Screen criada na organização do Admin chamador.
 *
 * Fluxo:
 *  1. Valida JWT do caller, garante que é admin_master ou gestor.
 *  2. Procura o código em pairing_codes (sem org, dentro da validade).
 *  3. Cria a screen na org do caller.
 *  4. Marca o código como usado e vincula ao screen_id + organization_id.
 *  5. Player detecta used_at via polling e entra em modo "pareado".
 */
export const claimPairingCode = createServerFn({ method: "POST" })
  .inputValidator(validate)
  .handler(async ({ data }) => {
    if (!SUPABASE_URL || !ANON_KEY) {
      console.error("[claimPairingCode] Supabase URL ou anon key ausentes no runtime.");
      throw new Error("Configuração do servidor incompleta para realizar o pareamento.");
    }

    const authHeader = getRequestHeader("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Não autenticado.");

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) throw new Error("Sessão inválida.");
    const callerAuthId = userData.user.id;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, role, organization_id")
      .eq("auth_user_id", callerAuthId)
      .maybeSingle();
    if (profileErr) throw new Error(profileErr.message);
    if (!profile) throw new Error("Perfil não encontrado.");
    if (profile.role !== "admin_master" && profile.role !== "gestor" && profile.role !== "operador")
      throw new Error("Sem permissão para parear telas.");

    const orgId = profile.organization_id as string;

    // Bloqueio por plano: só pode parear se houver licença ativa e cota disponível.
    await assertCanAddScreen(supabaseAdmin, orgId);

    // Busca o código (pode estar anônimo, sem organization_id)
    const { data: pairing, error: pairingErr } = await supabaseAdmin
      .from("pairing_codes")
      .select("id, code, used_at, expires_at, screen_id, player_platform")
      .eq("code", data.code)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pairingErr) throw new Error(pairingErr.message);
    if (!pairing)
      throw new Error(
        "Código não encontrado. Confira se o código exibido no player é o atual ou gere um novo.",
      );
    if (pairing.used_at || pairing.screen_id) throw new Error("Este código já foi utilizado.");
    if (pairing.expires_at && new Date(pairing.expires_at).getTime() < Date.now())
      throw new Error("Código expirado. Gere um novo no player.");

    const claimedPlatform =
      typeof pairing.player_platform === "string"
        ? normalizePlayerPlatform(pairing.player_platform)
        : data.platform;
    const caps = getPlayerCapabilities(claimedPlatform);
    const insertRow: Record<string, unknown> = {
      organization_id: orgId,
      unit_id: data.unit_id,
      name: data.name,
      orientation: toScreenOrientation(data.orientation),
      pairing_code: data.code,
      device_status: "offline",
      is_online: false,
      platform: caps.platform,
      store_type: caps.storeTypeHint,
    };

    // Cria a screen
    const { data: screen, error: screenErr } = await supabaseAdmin
      .from("screens")
      .insert(insertRow)
      .select("id, name")
      .single();
    if (screenErr) throw new Error(screenErr.message);

    const { error: devInsErr } = await supabaseAdmin.from("player_devices").insert({
      screen_id: screen.id as string,
      device_name: data.name,
      pairing_status: "pending_pairing",
    });
    if (devInsErr) {
      console.warn("[claimPairingCode] player_devices (opcional):", devInsErr.message);
    }

    // Marca código como usado e vincula
    const { error: updErr } = await supabaseAdmin
      .from("pairing_codes")
      .update({
        used_at: new Date().toISOString(),
        screen_id: screen.id,
        organization_id: orgId,
      })
      .eq("id", pairing.id);
    if (updErr) {
      // rollback da screen para não deixar lixo
      await supabaseAdmin.from("screens").delete().eq("id", screen.id);
      throw new Error(updErr.message);
    }

    return {
      ok: true,
      screen_id: screen.id,
      screen_name: screen.name,
      /** Plataforma persistida (android | tizen) — útil para o painel sem novo SELECT. */
      platform: caps.platform,
    };
  });

/**
 * Cria um novo código de pareamento anônimo (sem org).
 * Roda no servidor com supabaseAdmin para contornar RLS — o player /pareamento
 * é público e não tem sessão autenticada.
 */
function validateCreatePairingInput(input: unknown): { platform: PlayerPlatform } {
  if (input == null || typeof input !== "object") return { platform: "android" };
  const p = (input as Record<string, unknown>).platform;
  if (p === "tizen" || p === "android" || p === "web") return { platform: p };
  if (typeof p === "string") return { platform: normalizePlayerPlatform(p) };
  return { platform: "android" };
}

export const createPairingCode = createServerFn({ method: "POST" })
  .inputValidator(validateCreatePairingInput)
  .handler(async ({ data }) => {
    // O supabaseAdmin já tem fallback de URL embutido (client.server.ts).
    // Aqui só validamos a service role key, que é obrigatória.
    const hasKey = Boolean(process.env.SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log("[createPairingCode] env check:", { hasKey });

    if (!hasKey) {
      throw new Error(
        "Configuração do servidor ausente (SERVICE_ROLE_KEY). Defina o secret no projeto.",
      );
    }

    const chunk = () => Math.random().toString(36).slice(2, 6).toUpperCase();
    const code = `${chunk()}-${chunk()}`;
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const platform = data.platform;

    try {
      const { data: inserted, error } = await supabaseAdmin
        .from("pairing_codes")
        .insert({ code, expires_at, player_platform: platform })
        .select("id, code, expires_at")
        .single();
      if (error) {
        console.error("[createPairingCode] insert error:", JSON.stringify(error));
        throw new Error(`Falha ao registrar código: ${error.message}`);
      }
      console.log("[createPairingCode] inserted:", inserted?.code);
      const savedCode = inserted?.code ?? code;
      return {
        code: savedCode,
        pairing_code: savedCode,
        expires_at: inserted?.expires_at ?? expires_at,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[createPairingCode] exception:", msg);
      throw new Error(msg || "Não foi possível registrar o código de pareamento.");
    }
  });

/**
 * Equivalente da Edge Function `pair-screen`, exposto como server function
 * para que funcione mesmo quando a Edge Function não está deployada.
 *
 * Vincula um deviceFingerprint a uma `screen` já criada (via claimPairingCode)
 * e emite credenciais persistentes (device_id + auth_token) para o player.
 */
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

function generateAuthToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const pairScreenDevice = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (typeof input !== "object" || input === null) throw new Error("Payload inválido.");
    const o = input as Record<string, unknown>;
    if (typeof o.pairingCode !== "string" || o.pairingCode.length < 4)
      throw new Error("Código inválido.");
    if (typeof o.deviceFingerprint !== "string" || o.deviceFingerprint.length < 4)
      throw new Error("Fingerprint inválido.");
    return {
      pairingCode: normalizeCode(o.pairingCode),
      deviceFingerprint: o.deviceFingerprint,
      platform: typeof o.platform === "string" ? o.platform : null,
      osName: typeof o.osName === "string" ? o.osName : null,
      playerVersion: typeof o.playerVersion === "string" ? o.playerVersion : null,
    };
  })
  .handler(async ({ data }) => {
    const { data: rpcData, error: rpcErr } = await supabaseAdmin.rpc("pair_screen_by_code", {
      p_pairing_code: data.pairingCode,
      p_device_fingerprint: data.deviceFingerprint,
      p_platform: data.platform,
      p_os_name: data.osName,
      p_player_version: data.playerVersion,
    });
    if (rpcErr) throw new Error(rpcErr.message);
    const rows = (rpcData as Array<Record<string, unknown>> | null) ?? [];
    const row = rows[0] ?? null;
    const screen = row
      ? (JSON.parse(JSON.stringify(row)) as Record<string, string | number | boolean | null>)
      : null;
    if (!row?.screen_id) {
      return {
        paired: true,
        screen,
        device_id: null as string | null,
        auth_token: null as string | null,
      };
    }

    const screenId = String(row.screen_id);
    const orgId = String(row.organization_id ?? "");
    const plain = generateAuthToken();
    const hash = await sha256Hex(plain);
    const now = new Date().toISOString();
    const deviceName = String(row.screen_name ?? "display");

    const { data: existing, error: exErr } = await supabaseAdmin
      .from("player_devices")
      .select("id")
      .eq("screen_id", screenId)
      .maybeSingle();
    if (exErr) throw new Error(exErr.message);

    let deviceId: string;
    if (existing?.id) {
      const { error: upErr } = await supabaseAdmin
        .from("player_devices")
        .update({
          auth_secret_hash: hash,
          auth_issued_at: now,
          pairing_status: "active",
          device_name: deviceName,
          pairing_reset_at: null,
          updated_at: now,
        })
        .eq("id", existing.id);
      if (upErr) throw new Error(upErr.message);
      deviceId = String(existing.id);
    } else {
      const { data: ins, error: insErr } = await supabaseAdmin
        .from("player_devices")
        .insert({
          screen_id: screenId,
          device_name: deviceName,
          auth_secret_hash: hash,
          auth_issued_at: now,
          pairing_status: "active",
          updated_at: now,
        })
        .select("id")
        .single();
      if (insErr || !ins?.id)
        throw new Error(insErr?.message ?? "Falha ao registar dispositivo.");
      deviceId = String(ins.id);
    }

    if (orgId) {
      await supabaseAdmin.from("audit_logs").insert({
        organization_id: orgId,
        actor_profile_id: null,
        entity_type: "player_device",
        entity_id: deviceId,
        action: "device_credentials_issued",
        old_data: null,
        new_data: {
          screen_id: screenId,
          token_hash_prefix: hash.slice(0, 16),
          via: "pair_screen",
          at: now,
        },
      });
    }

    return { paired: true, screen, device_id: deviceId, auth_token: plain };
  });

/**
 * Endpoint público (sem auth) usado pelo player anônimo em /pareamento
 * para verificar se seu código já foi vinculado por um admin.
 * Usa supabaseAdmin para contornar RLS — retorna apenas o estado, sem dados sensíveis.
 */
export const checkPairingStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (typeof input !== "object" || input === null) throw new Error("Payload inválido.");
    const { code } = input as Record<string, unknown>;
    if (typeof code !== "string" || code.trim().length < 4) throw new Error("Código inválido.");
    return { code: normalizeCode(code) };
  })
  .handler(async ({ data }) => {
    try {
      const { data: pairing, error } = await supabaseAdmin
        .from("pairing_codes")
        .select("used_at, screen_id, expires_at")
        .eq("code", data.code)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("[checkPairingStatus] supabase error:", error.message);
        return {
          paired: false,
          expired: false,
          found: false,
          status: "pending" as const,
          screen_id: null,
        };
      }
      if (!pairing) {
        return {
          paired: false,
          expired: false,
          found: false,
          status: "pending" as const,
          screen_id: null,
        };
      }
      const expiredByTime = pairing.expires_at
        ? new Date(pairing.expires_at).getTime() < Date.now()
        : false;
      const paired = Boolean(pairing.used_at && pairing.screen_id);
      const expired = expiredByTime && !pairing.used_at;
      const status = paired
        ? ("paired" as const)
        : expired
          ? ("expired" as const)
          : ("pending" as const);
      return {
        paired,
        expired,
        found: true,
        status,
        /** Presente quando `paired` — permite ao player gravar credenciais para sync. */
        screen_id: paired ? (pairing.screen_id as string) : null,
      };
    } catch (e) {
      console.error("[checkPairingStatus] exception:", e instanceof Error ? e.message : String(e));
      return {
        paired: false,
        expired: false,
        found: false,
        status: "pending" as const,
        screen_id: null,
      };
    }
  });

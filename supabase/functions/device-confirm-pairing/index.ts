import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { adminClient } from "../_shared/client.ts";
import { readJson } from "../_shared/http.ts";
import {
  generatePlayerAuthToken,
  hashPrefixForAudit,
  normalizeDevicePairingCode,
  sha256Hex,
} from "../_shared/device-auth.ts";
import { insertPlayerDeviceAudit } from "../_shared/device-audit.ts";

const corsJsonHeaders: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsJsonHeaders });
}

type Body = {
  device_id?: string | null;
  deviceId?: string | null;
  screen_id?: string | null;
  screenId?: string | null;
  pairing_code?: string | null;
  pairingCode?: string | null;
  deviceFingerprint?: string | null;
  device_fingerprint?: string | null;
  platform?: string | null;
  osName?: string | null;
  os_name?: string | null;
  playerVersion?: string | null;
  player_version?: string | null;
};

function effectivePlatform(screenPlatform: string | null, bodyPlatform: string | null): string {
  const p = bodyPlatform != null ? String(bodyPlatform).trim().toLowerCase() : "";
  if (p === "android" || p === "tizen") return p;
  const s = String(screenPlatform ?? "").trim().toLowerCase();
  if (s === "android" || s === "tizen") return s;
  return "android";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson<Body>(req);
    const deviceId = String(body.device_id ?? body.deviceId ?? "").trim();
    const screenId = String(body.screen_id ?? body.screenId ?? "").trim();
    const pairingRaw = body.pairing_code ?? body.pairingCode ?? "";
    const codeNorm = normalizeDevicePairingCode(String(pairingRaw));
    if ((!deviceId && !screenId) || codeNorm.length < 4) {
      return jsonResponse({ error: "device_id ou screen_id, e pairing_code, são obrigatórios." }, 400);
    }

    let q = adminClient.from("player_devices").select("id, screen_id, pairing_status").eq(
      "pairing_status",
      "pending_pairing",
    );
    if (deviceId) q = q.eq("id", deviceId);
    else q = q.eq("screen_id", screenId);

    const { data: dev, error: devErr } = await q.maybeSingle();
    if (devErr) return jsonResponse({ error: devErr.message }, 400);
    if (!dev?.screen_id) {
      return jsonResponse({ error: "Dispositivo não encontrado ou não está pendente de pareamento." }, 404);
    }

    const { data: screen, error: scrErr } = await adminClient
      .from("screens")
      .select(
        "id, organization_id, name, pairing_code, pairing_expires_at, platform, os_name, player_version, device_fingerprint",
      )
      .eq("id", dev.screen_id)
      .maybeSingle();
    if (scrErr || !screen?.id) return jsonResponse({ error: "Tela não encontrada." }, 404);

    const screenPairing = screen.pairing_code ? normalizeDevicePairingCode(String(screen.pairing_code)) : "";
    if (!screenPairing || screenPairing !== codeNorm) {
      return jsonResponse({ error: "Código de pareamento inválido." }, 400);
    }
    const exp = screen.pairing_expires_at ? new Date(String(screen.pairing_expires_at)).getTime() : 0;
    if (exp && exp < Date.now()) {
      return jsonResponse({ error: "Código de pareamento expirado." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = (Deno.env.get("SUPABASE_ANON_KEY") ?? "").trim();
    const authHeader = req.headers.get("authorization") ?? "";
    const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
    let confirmedViaPanel = false;

    if (bearer && anonKey && bearer !== anonKey && bearer.split(".").length === 3) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: uData, error: authErr } = await userClient.auth.getUser();
      if (authErr || !uData.user) {
        return jsonResponse({ error: "Sessão inválida no cabeçalho Authorization." }, 401);
      }
      const { data: profile } = await adminClient
        .from("profiles")
        .select("id, organization_id, role")
        .eq("auth_user_id", uData.user.id)
        .maybeSingle();
      if (!profile || (profile.role !== "admin_master" && profile.role !== "gestor")) {
        return jsonResponse({ error: "Sem permissão para confirmar pareamento no painel." }, 403);
      }
      if (String(profile.organization_id) !== String(screen.organization_id)) {
        return jsonResponse({ error: "Organização incompatível com a tela." }, 403);
      }
      confirmedViaPanel = true;
    }

    const fp = String(body.deviceFingerprint ?? body.device_fingerprint ?? "").trim() ||
      (screen.device_fingerprint ? String(screen.device_fingerprint) : "unknown");
    const vPlat = effectivePlatform(screen.platform as string | null, body.platform as string | null);
    const osName = String(body.osName ?? body.os_name ?? screen.os_name ?? "").trim() || null;
    const playerVersion = String(body.playerVersion ?? body.player_version ?? screen.player_version ?? "").trim() ||
      null;

    const now = new Date().toISOString();
    const { error: upScrErr } = await adminClient
      .from("screens")
      .update({
        device_fingerprint: fp,
        platform: vPlat,
        os_name: osName,
        player_version: playerVersion,
        pairing_code: null,
        pairing_expires_at: null,
        device_status: "online",
        is_online: true,
        last_seen_at: now,
        updated_at: now,
      })
      .eq("id", screen.id);
    if (upScrErr) return jsonResponse({ error: upScrErr.message }, 400);

    const plain = generatePlayerAuthToken();
    const hash = await sha256Hex(plain);
    const { error: upDevErr } = await adminClient
      .from("player_devices")
      .update({
        auth_secret_hash: hash,
        auth_issued_at: now,
        pairing_status: "active",
        device_name: String(screen.name ?? "display"),
        pairing_reset_at: null,
        updated_at: now,
      })
      .eq("id", dev.id);
    if (upDevErr) return jsonResponse({ error: upDevErr.message }, 400);

    await insertPlayerDeviceAudit(
      adminClient,
      screen.organization_id as string,
      dev.id as string,
      "pairing_confirmed",
      { pairing_code_suffix: codeNorm.slice(-5) },
      {
        new_token_hash_prefix: hashPrefixForAudit(hash),
        screen_id: screen.id,
        confirmed_via_panel: confirmedViaPanel,
        at: now,
      },
    );

    return jsonResponse({
      ok: true,
      device_id: dev.id,
      auth_token: plain,
      screen_id: screen.id,
      organization_id: screen.organization_id,
      screen_name: screen.name,
      status: "active",
      platform: vPlat,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

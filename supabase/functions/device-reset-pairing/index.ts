import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { readJson } from "../_shared/http.ts";
import { sha256Hex, hashPrefixForAudit } from "../_shared/device-auth.ts";
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
  auth_token?: string | null;
  authToken?: string | null;
};

function pickDeviceId(b: Body): string {
  return String(b.device_id ?? b.deviceId ?? "").trim();
}

function pickAuthToken(b: Body): string {
  return String(b.auth_token ?? b.authToken ?? "").trim();
}

function randomPairingCode(): string {
  const chunk = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${chunk()}-${chunk()}`;
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
    const deviceId = pickDeviceId(body);
    const authToken = pickAuthToken(body);
    if (!deviceId || !authToken) {
      return jsonResponse({ error: "device_id e auth_token são obrigatórios." }, 400);
    }

    const { data: dev, error: devErr } = await adminClient
      .from("player_devices")
      .select("id, screen_id, auth_secret_hash, pairing_status")
      .eq("id", deviceId)
      .maybeSingle();

    if (devErr) return jsonResponse({ error: devErr.message }, 400);
    if (!dev?.screen_id) return jsonResponse({ error: "Dispositivo não encontrado." }, 404);

    const presentedHash = await sha256Hex(authToken);
    if (!dev.auth_secret_hash || dev.auth_secret_hash !== presentedHash) {
      return jsonResponse({ error: "Token inválido ou revogado." }, 401);
    }
    if (dev.pairing_status !== "active") {
      return jsonResponse({ error: "Dispositivo já está pendente de pareamento." }, 400);
    }

    const { data: screen, error: scrErr } = await adminClient
      .from("screens")
      .select("id, organization_id, pairing_code")
      .eq("id", dev.screen_id)
      .maybeSingle();
    if (scrErr || !screen?.organization_id) {
      return jsonResponse({ error: "Tela não encontrada." }, 404);
    }

    const orgId = screen.organization_id as string;
    const invalidatedPrefix = hashPrefixForAudit(await sha256Hex(authToken));

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    let newCode = "";
    let lastUpErr: { message: string; code?: string } | null = null;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      newCode = randomPairingCode();
      const { error: upErr } = await adminClient
        .from("screens")
        .update({
          pairing_code: newCode,
          pairing_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dev.screen_id);

      if (!upErr) {
        lastUpErr = null;
        break;
      }
      lastUpErr = { message: upErr.message, code: upErr.code };
      if (!String(upErr.message).toLowerCase().includes("unique") && upErr.code !== "23505") {
        return jsonResponse({ error: upErr.message }, 400);
      }
    }
    if (lastUpErr) return jsonResponse({ error: lastUpErr.message }, 400);

    const now = new Date().toISOString();
    const { error: devUpErr } = await adminClient
      .from("player_devices")
      .update({
        auth_secret_hash: null,
        auth_issued_at: null,
        pairing_status: "pending_pairing",
        pairing_reset_at: now,
        playlist_id: null,
        updated_at: now,
      })
      .eq("id", dev.id);
    if (devUpErr) return jsonResponse({ error: devUpErr.message }, 400);

    await insertPlayerDeviceAudit(
      adminClient,
      orgId,
      dev.id as string,
      "pairing_reset",
      {
        invalidated_token_hash_prefix: invalidatedPrefix,
        reset_at: now,
      },
      {
        new_pairing_code_suffix: newCode.slice(-5),
        pairing_expires_at: expiresAt,
      },
    );

    return jsonResponse({
      ok: true,
      device_id: dev.id,
      screen_id: dev.screen_id,
      pairing_code: newCode,
      pairing_code_expires_at: expiresAt,
      status: "pending_pairing",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

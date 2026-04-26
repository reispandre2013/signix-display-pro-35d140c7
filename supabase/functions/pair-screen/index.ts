import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";
import { generatePlayerAuthToken, hashPrefixForAudit, sha256Hex } from "../_shared/device-auth.ts";
import { insertPlayerDeviceAudit } from "../_shared/device-audit.ts";

type PairScreenPayload = {
  pairingCode: string;
  deviceFingerprint: string;
  platform?: string;
  osName?: string;
  playerVersion?: string;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson<PairScreenPayload>(req);
    const { data, error } = await adminClient.rpc("pair_screen_by_code", {
      p_pairing_code: body.pairingCode,
      p_device_fingerprint: body.deviceFingerprint,
      p_platform: body.platform ?? null,
      p_os_name: body.osName ?? null,
      p_player_version: body.playerVersion ?? null,
    });

    if (error) return jsonResponse({ error: error.message }, 400);
    const row = data?.[0] ?? null;
    if (!row?.screen_id) {
      return jsonResponse({ paired: true, screen: row, device_id: null, auth_token: null });
    }

    const screenId = String(row.screen_id);
    const orgId = String(row.organization_id ?? "");
    const plain = generatePlayerAuthToken();
    const hash = await sha256Hex(plain);
    const now = new Date().toISOString();
    const deviceName = String(row.screen_name ?? "display");

    const { data: existing, error: exErr } = await adminClient
      .from("player_devices")
      .select("id")
      .eq("screen_id", screenId)
      .maybeSingle();
    if (exErr) return jsonResponse({ error: exErr.message }, 400);

    let deviceId: string;
    if (existing?.id) {
      const { error: upErr } = await adminClient
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
      if (upErr) return jsonResponse({ error: upErr.message }, 400);
      deviceId = String(existing.id);
    } else {
      const { data: ins, error: insErr } = await adminClient
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
        return jsonResponse({ error: insErr?.message ?? "Falha ao registar dispositivo." }, 400);
      deviceId = String(ins.id);
    }

    if (orgId) {
      await insertPlayerDeviceAudit(
        adminClient,
        orgId,
        deviceId,
        "device_credentials_issued",
        null,
        {
          screen_id: screenId,
          token_hash_prefix: hashPrefixForAudit(hash),
          via: "pair_screen",
          at: now,
        },
      );
    }

    return jsonResponse({
      paired: true,
      screen: row,
      device_id: deviceId,
      auth_token: plain,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

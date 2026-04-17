import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";

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
    return jsonResponse({ paired: true, screen: data?.[0] ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

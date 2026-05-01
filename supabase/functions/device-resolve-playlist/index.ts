import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { readJson } from "../_shared/http.ts";
import { assertDevicePlayerForScreen } from "../_shared/device-player-auth.ts";
import { resolvePlaylistByScreenId } from "../_shared/resolve-playlist-edge.ts";

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

    let devRow: { screen_id: string; device_row_id: string };
    try {
      devRow = await assertDevicePlayerForScreen(adminClient, deviceId, authToken);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao validar dispositivo.";
      let st = 400;
      if (msg.includes("inválido") || msg.includes("revogado")) st = 401;
      else if (msg.includes("pendente")) st = 403;
      else if (msg.includes("não encontrado")) st = 404;
      return jsonResponse({ error: msg }, st);
    }

    const now = new Date().toISOString();
    const result = await resolvePlaylistByScreenId(adminClient, devRow.screen_id);
    const playlistId =
      result.payload && typeof result.payload === "object" && "playlist_id" in result.payload
        ? ((result.payload as { playlist_id?: string | null }).playlist_id ?? null)
        : null;

    await adminClient
      .from("player_devices")
      .update({
        last_seen_at: now,
        playlist_id: playlistId,
        updated_at: now,
      })
      .eq("id", devRow.device_row_id);

    return jsonResponse({
      ...result,
      device_id: devRow.device_row_id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

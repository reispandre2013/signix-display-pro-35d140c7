import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";
import { touchWebSession, validateWebSession } from "../_shared/web-player.ts";

type Body = {
  screen_id: string;
  device_token: string;
  browser?: string | null;
  user_agent?: string | null;
  width?: number | null;
  height?: number | null;
  online?: boolean;
  playlist_id?: string | null;
  media_asset_id?: string | null;
  player_version?: string | null;
  last_error?: string | null;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  try {
    const body = await readJson<Body>(req);
    const ctx = await validateWebSession(body.screen_id, body.device_token);
    await touchWebSession(ctx.sessionId);
    const now = new Date().toISOString();

    await adminClient.from("screen_heartbeats").insert({
      screen_id: ctx.screenId,
      platform: "web",
      app_version: body.player_version ?? null,
      network_status: body.online === false ? "offline" : "online",
      storage_status: null,
      player_status: body.last_error ? "warning" : "playing",
      current_campaign_id: null,
      current_media_id: body.media_asset_id ?? null,
      free_storage_mb: null,
    });

    await adminClient
      .from("screens")
      .update({
        browser_name: body.browser ?? null,
        user_agent: body.user_agent ?? null,
        screen_width: body.width ?? null,
        screen_height: body.height ?? null,
        resolution:
          typeof body.width === "number" && typeof body.height === "number"
            ? `${Math.round(body.width)}x${Math.round(body.height)}`
            : null,
        current_playlist_id: body.playlist_id ?? null,
        last_seen_at: now,
        is_online: body.online !== false,
        device_status: body.online === false || body.last_error ? "warning" : "online",
      })
      .eq("id", ctx.screenId);

    return jsonResponse({ ok: true, at: now });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 400);
  }
});

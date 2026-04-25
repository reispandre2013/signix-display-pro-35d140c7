import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";
import { validateWebSession } from "../_shared/web-player.ts";

type Body = {
  screen_id: string;
  device_token: string;
  local_event_id: string;
  media_asset_id?: string | null;
  playlist_id?: string | null;
  campaign_id?: string | null;
  playback_status: "started" | "ended" | "failed" | "skipped";
  duration_played?: number | null;
  error_message?: string | null;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  try {
    const body = await readJson<Body>(req);
    const ctx = await validateWebSession(body.screen_id, body.device_token);
    const marker = `web:${body.local_event_id}`;

    const { data: existing } = await adminClient
      .from("playback_logs")
      .select("id")
      .eq("screen_id", ctx.screenId)
      .eq("proof_hash", marker)
      .maybeSingle();
    if (existing?.id) return jsonResponse({ ok: true, deduped: true });

    const { error } = await adminClient.from("playback_logs").insert({
      organization_id: ctx.organizationId,
      screen_id: ctx.screenId,
      campaign_id: body.campaign_id ?? null,
      media_asset_id: body.media_asset_id ?? null,
      displayed_at: new Date().toISOString(),
      duration_played: body.duration_played ?? null,
      proof_hash: marker,
      verification_status: body.playback_status === "failed" ? "failed" : "verified",
      metadata: {
        playlist_id: body.playlist_id ?? null,
        error_message: body.error_message ?? null,
        playback_status: body.playback_status,
        source: "web_player",
      },
    });
    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 400);
  }
});

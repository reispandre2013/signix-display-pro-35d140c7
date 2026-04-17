import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";

type ProofPayload = {
  screenId: string;
  campaignId?: string | null;
  playlistId?: string | null;
  mediaAssetId?: string | null;
  durationPlayed?: number | null;
  playbackStatus?: string | null;
  localEventId?: string | null;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson<ProofPayload>(req);
    const { data, error } = await adminClient.rpc("register_playback_log", {
      p_screen_id: body.screenId,
      p_campaign_id: body.campaignId ?? null,
      p_playlist_id: body.playlistId ?? null,
      p_media_asset_id: body.mediaAssetId ?? null,
      p_duration_played: body.durationPlayed ?? null,
      p_playback_status: body.playbackStatus ?? "ok",
      p_local_event_id: body.localEventId ?? null,
    });

    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ proofHash: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

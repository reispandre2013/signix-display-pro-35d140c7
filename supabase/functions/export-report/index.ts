import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";

type ExportPayload = {
  organizationId: string;
  from?: string;
  to?: string;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson<ExportPayload>(req);
    const from = body.from ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const to = body.to ?? new Date().toISOString();

    const { data, error } = await adminClient
      .from("playback_logs")
      .select(
        "played_at,screen_id,campaign_id,playlist_id,media_asset_id,duration_played,playback_status",
      )
      .eq("organization_id", body.organizationId)
      .gte("played_at", from)
      .lte("played_at", to)
      .order("played_at", { ascending: false })
      .limit(5000);

    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ from, to, count: data.length, rows: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

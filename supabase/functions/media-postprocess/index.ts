import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";

type MediaPostProcessPayload = {
  mediaAssetId: string;
  thumbnailUrl?: string;
  publicUrl?: string;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson<MediaPostProcessPayload>(req);
    const { data, error } = await adminClient
      .from("media_assets")
      .update({
        thumbnail_url: body.thumbnailUrl ?? null,
        public_url: body.publicUrl ?? null,
      })
      .eq("id", body.mediaAssetId)
      .select("id,name,thumbnail_url,public_url")
      .single();

    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ mediaAsset: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

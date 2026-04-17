import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";

type PublishPayload = {
  campaignId: string;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson<PublishPayload>(req);
    const { data, error } = await adminClient
      .from("campaigns")
      .update({ status: "active" })
      .eq("id", body.campaignId)
      .select("id,status")
      .single();

    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ campaign: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";
import { randomToken, validateWebSession } from "../_shared/web-player.ts";

type Body = {
  screen_id: string;
  device_token: string;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  try {
    const body = await readJson<Body>(req);
    const ctx = await validateWebSession(body.screen_id, body.device_token);
    const displayToken = randomToken(42);
    const exp = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    const { error } = await adminClient
      .from("screens")
      .update({
        display_token: displayToken,
        display_token_expires_at: exp,
        device_status: "online",
        is_online: true,
      })
      .eq("id", ctx.screenId)
      .eq("organization_id", ctx.organizationId);
    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ ok: true, display_token: displayToken, display_expires_at: exp });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 400);
  }
});

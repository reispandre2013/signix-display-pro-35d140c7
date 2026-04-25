import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";

type Body = { screen_id: string };

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  try {
    const body = await readJson<Body>(req);
    const screenId = String(body.screen_id ?? "").trim();
    if (!screenId) return jsonResponse({ error: "screen_id obrigatório." }, 400);
    const now = new Date().toISOString();
    const { error: sesErr } = await adminClient
      .from("web_player_sessions")
      .update({ status: "revoked", revoked_at: now, updated_at: now })
      .eq("screen_id", screenId)
      .eq("status", "active");
    if (sesErr) return jsonResponse({ error: sesErr.message }, 400);
    const { error: scrErr } = await adminClient
      .from("screens")
      .update({
        device_token_hash: null,
        display_token: null,
        display_token_expires_at: null,
        is_online: false,
        device_status: "offline",
      })
      .eq("id", screenId);
    if (scrErr) return jsonResponse({ error: scrErr.message }, 400);
    return jsonResponse({ ok: true, revoked_at: now });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 400);
  }
});

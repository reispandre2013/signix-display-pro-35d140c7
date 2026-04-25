import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";
import { randomToken, validateWebSession } from "../_shared/web-player.ts";
import { sha256Hex } from "../_shared/device-auth.ts";

type Body = {
  screen_id: string;
  device_token: string;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  try {
    const body = await readJson<Body>(req);
    const ctx = await validateWebSession(body.screen_id, body.device_token);
    const nextToken = randomToken();
    const nextHash = await sha256Hex(nextToken);
    const now = new Date().toISOString();

    const { error: sesErr } = await adminClient
      .from("web_player_sessions")
      .update({ device_token_hash: nextHash, updated_at: now })
      .eq("id", ctx.sessionId);
    if (sesErr) return jsonResponse({ error: sesErr.message }, 400);

    await adminClient.from("screens").update({ device_token_hash: nextHash }).eq("id", ctx.screenId);
    return jsonResponse({ ok: true, device_token: nextToken });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 400);
  }
});

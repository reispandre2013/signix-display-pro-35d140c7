import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";

type Body = {
  screen_name: string;
  organization_id?: string | null;
};

function makeCode() {
  const c = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${c()}-${c()}`;
}

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  try {
    const body = await readJson<Body>(req);
    const code = makeCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { data, error } = await adminClient
      .from("pairing_codes")
      .insert({
        code,
        expires_at: expiresAt,
        organization_id: body.organization_id ?? null,
        player_platform: "web",
      })
      .select("id, code, expires_at")
      .single();
    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ ok: true, pairing_code: data.code, expires_at: data.expires_at });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 400);
  }
});

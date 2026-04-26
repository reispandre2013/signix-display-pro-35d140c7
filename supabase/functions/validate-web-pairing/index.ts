import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";
import { browserFromUserAgent, randomToken } from "../_shared/web-player.ts";
import { sha256Hex } from "../_shared/device-auth.ts";

type Body = {
  pairing_code: string;
  fingerprint: string;
  user_agent?: string;
  screen_width?: number | null;
  screen_height?: number | null;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  try {
    const body = await readJson<Body>(req);
    const code = String(body.pairing_code ?? "")
      .trim()
      .toUpperCase();
    if (!code) return jsonResponse({ error: "pairing_code obrigatório." }, 400);

    const { data: pairing, error: pairingErr } = await adminClient
      .from("pairing_codes")
      .select("id, code, used_at, expires_at, screen_id, organization_id")
      .eq("code", code)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (pairingErr) return jsonResponse({ error: pairingErr.message }, 400);
    if (!pairing?.screen_id || !pairing.organization_id || !pairing.used_at) {
      return jsonResponse({ error: "Código ainda não vinculado no painel." }, 409);
    }
    if (pairing.expires_at && new Date(pairing.expires_at).getTime() < Date.now()) {
      return jsonResponse({ error: "Código expirado." }, 410);
    }

    const ua = String(body.user_agent ?? req.headers.get("user-agent") ?? "");
    const browser = browserFromUserAgent(ua);
    const token = randomToken();
    const tokenHash = await sha256Hex(token);

    const { data: session, error: sessionErr } = await adminClient
      .from("web_player_sessions")
      .insert({
        screen_id: pairing.screen_id,
        organization_id: pairing.organization_id,
        device_token_hash: tokenHash,
        fingerprint: String(body.fingerprint ?? "").slice(0, 255),
        user_agent: ua.slice(0, 1024),
        browser_name: browser.name,
        browser_version: browser.version,
        status: "active",
        paired_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (sessionErr) return jsonResponse({ error: sessionErr.message }, 400);

    const resolution =
      typeof body.screen_width === "number" && typeof body.screen_height === "number"
        ? `${Math.round(body.screen_width)}x${Math.round(body.screen_height)}`
        : null;
    await adminClient
      .from("screens")
      .update({
        platform: "web",
        player_type: "web_player",
        device_token_hash: tokenHash,
        device_fingerprint: String(body.fingerprint ?? "").slice(0, 255),
        browser_name: browser.name,
        browser_version: browser.version,
        user_agent: ua.slice(0, 1024),
        resolution,
        screen_width: body.screen_width ?? null,
        screen_height: body.screen_height ?? null,
        device_status: "online",
        is_online: true,
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", pairing.screen_id);

    return jsonResponse({
      ok: true,
      screen_id: pairing.screen_id,
      organization_id: pairing.organization_id,
      session_id: session.id,
      device_token: token,
      player_url: `/player/web?screenId=${pairing.screen_id}`,
      display_url: `/display/${token}`,
    });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 400);
  }
});

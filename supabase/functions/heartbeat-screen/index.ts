import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";

type HeartbeatPayload = {
  screenId?: string | null;
  screen_id?: string | null;
  appVersion?: string | null;
  ipAddress?: string | null;
  networkStatus?: string | null;
  deviceInfo?: Record<string, unknown>;
  isOk?: boolean;
  errorMessage?: string | null;
};

const corsHeaders: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

/** Alguns WebViews (ex.: Tizen) enviam JSON sem `Content-Type: application/json`. */
async function parseJsonBody(req: Request): Promise<HeartbeatPayload> {
  const text = await req.text();
  if (!text || !String(text).trim()) {
    throw new Error("Empty body");
  }
  try {
    return JSON.parse(text) as HeartbeatPayload;
  } catch {
    throw new Error("Invalid JSON body");
  }
}

function resolveScreenId(body: HeartbeatPayload): string {
  const id = String(body.screenId ?? body.screen_id ?? "").trim();
  return id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await parseJsonBody(req);
    const screenId = resolveScreenId(body);
    if (!screenId) {
      return jsonResponse({ error: "screenId is required" }, 400);
    }

    const { data: screenRow, error: screenErr } = await adminClient
      .from("screens")
      .select("id")
      .eq("id", screenId)
      .maybeSingle();
    if (screenErr) return jsonResponse({ error: screenErr.message }, 400);
    if (!screenRow?.id) {
      return jsonResponse({ error: "screen not found" }, 404);
    }

    const now = new Date().toISOString();
    const platformRaw = body.deviceInfo && typeof body.deviceInfo.platform === "string"
      ? body.deviceInfo.platform
      : "tizen";
    const platform = String(platformRaw || "tizen").slice(0, 64);

    const { error: insErr } = await adminClient.from("screen_heartbeats").insert({
      screen_id: screenId,
      platform,
      app_version: body.appVersion ?? null,
      network_status: body.networkStatus ?? null,
      storage_status: null,
      player_status: body.isOk === false ? "error" : "ok",
      current_campaign_id: null,
      current_media_id: null,
      free_storage_mb: null,
    });
    if (insErr) {
      return jsonResponse({ error: insErr.message }, 400);
    }

    const patch: Record<string, unknown> = {
      last_seen_at: now,
      is_online: true,
      device_status: body.isOk === false ? "warning" : "online",
    };
    if (body.appVersion) {
      patch.player_version = String(body.appVersion);
    }

    const { error: upErr } = await adminClient.from("screens").update(patch).eq("id", screenId);
    if (upErr) return jsonResponse({ error: upErr.message }, 400);

    return jsonResponse({ ok: true, server_time: now });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

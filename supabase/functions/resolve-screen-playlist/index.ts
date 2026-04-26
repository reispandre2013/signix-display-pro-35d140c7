import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { readJson } from "../_shared/http.ts";
import { resolvePlaylistByScreenId } from "../_shared/resolve-playlist-edge.ts";

type ResolvePayload = {
  screenId?: string | null;
  screen_id?: string | null;
  pairingCode?: string | null;
  pairing_code?: string | null;
  code?: string | null;
};

const corsJsonHeaders: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsJsonHeaders });
}

function normalizeScreenId(raw: string | null | undefined): string {
  return String(raw ?? "").trim();
}

function normalizeCode(raw: string | null | undefined): string {
  return String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

async function resolveLegacyScreenIdByPairingCode(code: string): Promise<string> {
  if (!code) return "";
  const { data: screen, error } = await adminClient
    .from("screens")
    .select("id")
    .eq("pairing_code", code)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return screen?.id ? String(screen.id) : "";
}

async function resolveScreenIdFromInput(body: ResolvePayload): Promise<string> {
  const byId = normalizeScreenId(body.screenId ?? body.screen_id ?? null);
  if (byId) return byId;

  const code = normalizeCode(body.pairingCode ?? body.pairing_code ?? body.code ?? null);
  if (!code) return "";

  const { data: pairing, error } = await adminClient
    .from("pairing_codes")
    .select("screen_id, used_at")
    .eq("code", code)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (pairing?.screen_id && pairing?.used_at) return String(pairing.screen_id);

  const legacyScreenId = await resolveLegacyScreenIdByPairingCode(code);
  if (!legacyScreenId) return "";

  await adminClient
    .from("pairing_codes")
    .update({
      screen_id: legacyScreenId,
      used_at: pairing?.used_at ?? new Date().toISOString(),
    })
    .eq("code", code)
    .is("screen_id", null);

  return legacyScreenId;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson<ResolvePayload>(req).catch(() => ({}) as ResolvePayload);
    const screenId = await resolveScreenIdFromInput(body);
    const result = await resolvePlaylistByScreenId(adminClient, screenId);
    return jsonResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

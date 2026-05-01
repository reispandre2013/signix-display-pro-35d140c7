import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { readJson } from "../_shared/http.ts";
import { accessControlHeaders } from "../_shared/cors-env.ts";
import { assertDevicePlayerForScreen } from "../_shared/device-player-auth.ts";
import { resolvePlaylistByScreenId } from "../_shared/resolve-playlist-edge.ts";

type ResolvePayload = {
  screenId?: string | null;
  screen_id?: string | null;
  pairingCode?: string | null;
  pairing_code?: string | null;
  code?: string | null;
  device_id?: string | null;
  deviceId?: string | null;
  auth_token?: string | null;
  authToken?: string | null;
};

function jsonHeaders(req: Request): Record<string, string> {
  const h = accessControlHeaders(req, "POST, OPTIONS");
  return { ...h, "Content-Type": "application/json; charset=utf-8" };
}

function jsonResponse(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders(req) });
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

function legacyScreenUuidBlocked(req: Request, body: ResolvePayload): boolean {
  if (Deno.env.get("DENY_LEGACY_SCREEN_UUID_RESOLVE") !== "true") return false;

  const hadDirectUuid = Boolean(normalizeScreenId(body.screenId ?? body.screen_id ?? null));
  const hadPairingInput = Boolean(
    normalizeCode(body.pairingCode ?? body.pairing_code ?? body.code ?? null),
  );
  const deviceId = String(body.device_id ?? body.deviceId ?? "").trim();
  const authToken = String(body.auth_token ?? body.authToken ?? "").trim();
  const hadDevice = Boolean(deviceId && authToken);

  return hadDirectUuid && !hadPairingInput && !hadDevice;
}

serve(async (req) => {
  const cors = accessControlHeaders(req, "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed" }, 405);
  }

  try {
    const body = await readJson<ResolvePayload>(req).catch(() => ({}) as ResolvePayload);

    const deviceId = String(body.device_id ?? body.deviceId ?? "").trim();
    const authToken = String(body.auth_token ?? body.authToken ?? "").trim();

    let screenId = "";

    if (deviceId && authToken) {
      const dev = await assertDevicePlayerForScreen(adminClient, deviceId, authToken);
      screenId = dev.screen_id;
    } else {
      if (legacyScreenUuidBlocked(req, body)) {
        return jsonResponse(
          req,
          {
            error:
              "Resolução só com screenId está desativada neste ambiente. Use pareamento/código ou device_id + auth_token.",
          },
          403,
        );
      }
      screenId = await resolveScreenIdFromInput(body);
    }

    const result = await resolvePlaylistByScreenId(adminClient, screenId);
    return jsonResponse(req, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse(req, { error: message }, 400);
  }
});

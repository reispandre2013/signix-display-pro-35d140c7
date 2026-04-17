import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";

type HeartbeatPayload = {
  screenId: string;
  appVersion?: string;
  ipAddress?: string;
  networkStatus?: string;
  deviceInfo?: Record<string, unknown>;
  isOk?: boolean;
  errorMessage?: string | null;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson<HeartbeatPayload>(req);
    const { error } = await adminClient.rpc("register_screen_heartbeat", {
      p_screen_id: body.screenId,
      p_app_version: body.appVersion ?? null,
      p_ip_address: body.ipAddress ?? null,
      p_network_status: body.networkStatus ?? null,
      p_device_info: body.deviceInfo ?? {},
      p_is_ok: body.isOk ?? true,
      p_error_message: body.errorMessage ?? null,
    });

    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

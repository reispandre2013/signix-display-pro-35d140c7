import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse } from "../_shared/http.ts";

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const timeoutMinutes = Number(req.headers.get("x-health-timeout-minutes") ?? "5");

  const markOffline = await adminClient.rpc("mark_offline_screens", {
    p_timeout_minutes: Number.isFinite(timeoutMinutes) ? timeoutMinutes : 5,
  });

  if (markOffline.error) return jsonResponse({ error: markOffline.error.message }, 400);

  const cleanup = await adminClient.rpc("cleanup_orphan_media_assets");
  if (cleanup.error) return jsonResponse({ error: cleanup.error.message }, 400);

  return jsonResponse({
    ok: true,
    offlineScreensMarked: markOffline.data ?? 0,
    orphanMediaDeleted: cleanup.data ?? 0,
  });
});

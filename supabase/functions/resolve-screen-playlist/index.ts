import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";

type ResolvePayload = {
  screenId: string;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson<ResolvePayload>(req);
    const { data, error } = await adminClient.rpc("resolve_screen_payload", {
      p_screen_id: body.screenId,
    });

    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ payload: data ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

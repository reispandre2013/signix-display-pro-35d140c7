import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";

type SendAlertPayload = {
  organizationId: string;
  screenId?: string | null;
  alertType: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson<SendAlertPayload>(req);
    const { data, error } = await adminClient
      .from("alerts")
      .insert({
        organization_id: body.organizationId,
        screen_id: body.screenId ?? null,
        alert_type: body.alertType,
        severity: body.severity,
        message: body.message,
        status: "active",
      })
      .select("id,created_at")
      .single();

    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ alert: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

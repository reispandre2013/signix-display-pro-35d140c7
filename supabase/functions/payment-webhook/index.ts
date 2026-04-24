import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";

const cors: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Webhook de pagamento (stub). Configure `PAYMENT_WEBHOOK_SECRET` e valide no
 * adaptador real. Com `payment_succeeded`, amplie para:
 * activar licença, actualizar subscription, pagamento, invoice, audit_logs.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), { status: 405, headers: cors });
  }

  const secret = Deno.env.get("PAYMENT_WEBHOOK_SECRET");
  const incoming = req.headers.get("x-webhook-secret");
  if (secret && incoming !== secret) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid secret" }), { status: 401, headers: cors });
  }

  const rawBody = await req.text();
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody || "{}") as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), { status: 400, headers: cors });
  }

  const orgId = typeof payload.organization_id === "string" ? payload.organization_id : null;
  if (!orgId) {
    return new Response(
      JSON.stringify({ ok: false, error: "organization_id required in payload for stub" }),
      { status: 400, headers: cors },
    );
  }

  const amount = typeof payload.amount_cents === "number" ? payload.amount_cents : 0;
  const status = String(payload.status ?? "pending");
  const extId = String(payload.external_payment_id ?? `stub-${Date.now()}`);

  const { error } = await adminClient.from("payments").insert({
    organization_id: orgId,
    amount_cents: amount,
    status,
    payment_provider: String(payload.provider ?? "stub"),
    external_payment_id: extId,
    paid_at: status === "paid" || status === "succeeded" ? new Date().toISOString() : null,
    raw_payload: payload,
  });

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500, headers: cors });
  }

  // TODO: chamar lógica de activação (licença, subscription) com service role, idempotente por externalPaymentId
  return new Response(JSON.stringify({ ok: true, received: true }), { status: 200, headers: cors });
});

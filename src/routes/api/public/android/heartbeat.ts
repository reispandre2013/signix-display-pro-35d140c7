// POST /api/public/android/heartbeat
// Headers: Authorization: Bearer <device_token>
// Body: { app_version?, last_error?, current_media_id? }
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function bearer(req: Request): string | null {
  const h = req.headers.get("authorization") ?? "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

export const Route = createFileRoute("/api/public/android/heartbeat")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const token = bearer(request);
        if (!token) return new Response("unauthorized", { status: 401, headers: cors });

        let body: Record<string, unknown> = {};
        try {
          body = await request.json();
        } catch {
          /* */
        }

        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for") ??
          null;

        const nowIso = new Date().toISOString();
        const lastError = typeof body.last_error === "string" ? body.last_error : null;

        const { data: dev, error } = await supabaseAdmin
          .from("android_tv_devices")
          .update({
            last_seen_at: nowIso,
            last_ip: ip,
            app_version: typeof body.app_version === "string" ? body.app_version : undefined,
            last_error: lastError,
          })
          .eq("device_token", token)
          .select("screen_id")
          .maybeSingle();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...cors },
          });
        }

        // Espelha presença/online status na tela vinculada (UI lê de screens)
        if (dev?.screen_id) {
          await supabaseAdmin
            .from("screens")
            .update({
              last_seen_at: nowIso,
              is_online: true,
              device_status: lastError ? "warning" : "online",
            })
            .eq("id", dev.screen_id);
        }

        return Response.json({ ok: true }, { headers: cors });
      },
    },
  },
});

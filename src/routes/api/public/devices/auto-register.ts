import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

export const Route = createFileRoute("/api/public/devices/auto-register")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ error: "JSON inválido" }, 400);
        }
        const device_uuid = String(body.device_uuid ?? "").trim();
        if (!device_uuid || device_uuid.length < 8 || device_uuid.length > 100) {
          return json({ error: "device_uuid obrigatório" }, 400);
        }
        const platform = String(body.platform ?? "android_tv").slice(0, 32);
        const app_version = body.app_version ? String(body.app_version).slice(0, 64) : null;
        const tv_model = body.tv_model ? String(body.tv_model).slice(0, 128) : null;
        const manufacturer = body.manufacturer ? String(body.manufacturer).slice(0, 128) : null;

        const { data: existing, error: selErr } = await supabaseAdmin
          .from("player_devices")
          .select("id, screen_id, auto_register_status, device_name")
          .eq("device_uuid", device_uuid)
          .maybeSingle();
        if (selErr) return json({ error: selErr.message }, 500);

        const now = new Date().toISOString();
        if (existing) {
          await supabaseAdmin
            .from("player_devices")
            .update({ last_seen: now, app_version, tv_model, manufacturer })
            .eq("id", existing.id);
          return json({
            status: existing.auto_register_status ?? "pending",
            device_id: existing.id,
            screen_id: existing.screen_id,
            device_name: existing.device_name,
          });
        }

        const { data: created, error: insErr } = await supabaseAdmin
          .from("player_devices")
          .insert({
            device_uuid,
            platform,
            app_version,
            tv_model,
            manufacturer,
            auto_register_status: "pending",
            pairing_status: "pending_pairing",
            device_name: tv_model ?? "Android TV",
            last_seen: now,
          })
          .select("id")
          .single();
        if (insErr) return json({ error: insErr.message }, 500);

        return json({ status: "pending", device_id: created.id });
      },
    },
  },
});

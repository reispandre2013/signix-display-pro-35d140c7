import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "node:crypto";
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

function sha256(v: string) {
  return createHash("sha256").update(v, "utf8").digest("hex");
}

export const Route = createFileRoute("/api/public/devices/check-session")({
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
        const token = String(body.token ?? "");
        if (!device_uuid) return json({ status: "unknown" }, 200);

        const { data: dev, error } = await supabaseAdmin
          .from("player_devices")
          .select(
            "id, screen_id, auto_register_status, auth_secret_hash, pending_auth_token, organization_id, device_name",
          )
          .eq("device_uuid", device_uuid)
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!dev) return json({ status: "unknown" });

        if (dev.auto_register_status !== "active" || !dev.screen_id) {
          return json({
            status: dev.auto_register_status ?? "pending",
            device_id: dev.id,
          });
        }

        // Entrega o token em claro enquanto o cliente ainda não o devolveu.
        // NÃO limpa imediatamente: aguarda confirmação (poll subsequente
        // com token válido) para evitar perda em caso de falha de rede.
        if ((!token || token !== "") && dev.pending_auth_token) {
          // Se o cliente já enviou o token correto, podemos limpar.
          if (token && dev.auth_secret_hash === sha256(token)) {
            await supabaseAdmin
              .from("player_devices")
              .update({ pending_auth_token: null, last_seen: new Date().toISOString() })
              .eq("id", dev.id);
            return json({
              status: "active",
              device_id: dev.id,
              screen_id: dev.screen_id,
              device_name: dev.device_name,
              organization_id: dev.organization_id,
            });
          }
          // Caso contrário, (re)entrega o token em claro.
          await supabaseAdmin
            .from("player_devices")
            .update({ last_seen: new Date().toISOString() })
            .eq("id", dev.id);
          return json({
            status: "active",
            device_id: dev.id,
            screen_id: dev.screen_id,
            device_name: dev.device_name,
            organization_id: dev.organization_id,
            token: dev.pending_auth_token,
          });
        }

        if (!token || !dev.auth_secret_hash || dev.auth_secret_hash !== sha256(token)) {
          return json({ status: "invalid_token", device_id: dev.id }, 200);
        }

        const now = new Date().toISOString();
        await supabaseAdmin
          .from("player_devices")
          .update({ last_seen: now })
          .eq("id", dev.id);

        return json({
          status: "active",
          device_id: dev.id,
          screen_id: dev.screen_id,
          device_name: dev.device_name,
          organization_id: dev.organization_id,
        });
      },
    },
  },
});

// POST /api/public/android/register
// Body: { device_uuid, manufacturer?, model?, android_version?, app_version? }
// Comportamento: idempotente. Se já existe device_uuid → devolve registro existente.
// Caso contrário cria com pairing_code de 6 dígitos e device_token permanente.
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { randomBytes } from "crypto";

const Body = z.object({
  device_uuid: z.string().min(8).max(128),
  manufacturer: z.string().max(80).optional(),
  model: z.string().max(120).optional(),
  android_version: z.string().max(40).optional(),
  app_version: z.string().max(40).optional(),
});

function genCode6(): string {
  // 6 dígitos, sem zeros à esquerda em excesso
  const n = (randomBytes(4).readUInt32BE(0) % 900000) + 100000;
  return String(n);
}
function genToken(): string {
  return randomBytes(32).toString("hex");
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/android/register")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const json = await request.json();
          const data = Body.parse(json);

          // já existe?
          const { data: existing } = await supabaseAdmin
            .from("android_tv_devices")
            .select("device_uuid, device_token, pairing_code, status, screen_id")
            .eq("device_uuid", data.device_uuid)
            .maybeSingle();

          if (existing && existing.status !== "revoked") {
            // atualiza metadata (sem mexer em token/code)
            await supabaseAdmin
              .from("android_tv_devices")
              .update({
                manufacturer: data.manufacturer ?? null,
                model: data.model ?? null,
                android_version: data.android_version ?? null,
                app_version: data.app_version ?? null,
                last_seen_at: new Date().toISOString(),
              })
              .eq("device_uuid", data.device_uuid);

            return Response.json(
              {
                device_token: existing.device_token,
                pairing_code: existing.pairing_code,
                status: existing.status,
                paired: existing.status === "paired",
              },
              { headers: cors },
            );
          }

          // tenta gerar pairing_code único (poucos retries)
          let code = genCode6();
          for (let i = 0; i < 6; i += 1) {
            const { data: clash } = await supabaseAdmin
              .from("android_tv_devices")
              .select("id")
              .eq("pairing_code", code)
              .maybeSingle();
            if (!clash) break;
            code = genCode6();
          }
          const token = genToken();

          const { error } = await supabaseAdmin.from("android_tv_devices").insert({
            device_uuid: data.device_uuid,
            device_token: token,
            pairing_code: code,
            status: "pending",
            manufacturer: data.manufacturer ?? null,
            model: data.model ?? null,
            android_version: data.android_version ?? null,
            app_version: data.app_version ?? null,
            last_seen_at: new Date().toISOString(),
          });
          if (error) throw new Error(error.message);

          return Response.json(
            { device_token: token, pairing_code: code, status: "pending", paired: false },
            { headers: cors },
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : "bad request";
          return new Response(JSON.stringify({ error: msg }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...cors },
          });
        }
      },
    },
  },
});

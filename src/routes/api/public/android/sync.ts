// POST /api/public/android/sync
// Headers: Authorization: Bearer <device_token>
// Body: { etag?: string }
// Resp: { paired: boolean, pairing_code?: string, screen_id?, payload?: {...}, etag, intervals }
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  resolveScreenPlaylistPayload,
  buildPlaylistEtagFromSeed,
} from "@/lib/server/screen-playlist-payload";

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

export const Route = createFileRoute("/api/public/android/sync")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const token = bearer(request);
        if (!token) {
          return new Response(JSON.stringify({ error: "missing token" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...cors },
          });
        }
        const { data: dev, error: devErr } = await supabaseAdmin
          .from("android_tv_devices")
          .select(
            "id, device_uuid, status, screen_id, pairing_code, organization_id",
          )
          .eq("device_token", token)
          .maybeSingle();
        if (devErr || !dev) {
          return new Response(JSON.stringify({ error: "invalid token" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...cors },
          });
        }
        if (dev.status === "revoked") {
          return new Response(JSON.stringify({ error: "revoked" }), {
            status: 403,
            headers: { "Content-Type": "application/json", ...cors },
          });
        }

        // body opcional (etag)
        let body: { etag?: string } = {};
        try {
          body = await request.json();
        } catch {
          /* no body */
        }

        if (dev.status !== "paired" || !dev.screen_id) {
          return Response.json(
            {
              paired: false,
              pairing_code: dev.pairing_code,
              intervals: { sync: 15, heartbeat: 30 },
            },
            { headers: cors },
          );
        }

        const resolved = await resolveScreenPlaylistPayload(supabaseAdmin, dev.screen_id);
        const etag = buildPlaylistEtagFromSeed(resolved.etagSeed);

        // Carrega rádio configurada para a tela (se houver)
        const { data: radioRow } = await supabaseAdmin
          .from("radio_streams")
          .select("radio_name, stream_url, volume, is_active")
          .eq("screen_id", dev.screen_id)
          .maybeSingle();
        const radio =
          radioRow && radioRow.is_active && radioRow.stream_url
            ? {
                name: radioRow.radio_name,
                stream_url: radioRow.stream_url,
                volume: radioRow.volume ?? 0.8,
              }
            : null;

        if (body.etag && body.etag === etag) {
          return Response.json(
            {
              paired: true,
              screen_id: dev.screen_id,
              unchanged: true,
              etag,
              radio,
              intervals: { sync: 90, heartbeat: 60 },
            },
            { headers: cors },
          );
        }

        return Response.json(
          {
            paired: true,
            screen_id: dev.screen_id,
            organization_id: resolved.organization_id,
            playlist_id: resolved.playlist?.id ?? null,
            campaign_id: resolved.campaign?.id ?? null,
            display: resolved.display,
            items: resolved.items.map((i) => ({
              id: i.id,
              media_asset_id: i.media_asset_id,
              media_type: i.media_type,
              media_url: i.public_url,
              duration_seconds: i.duration_seconds ?? 8,
              position: i.position,
              fit_mode: i.fit_mode_effective,
            })),
            radio,
            etag,
            intervals: { sync: 90, heartbeat: 60 },
          },
          { headers: cors },
        );
      },
    },
  },
});

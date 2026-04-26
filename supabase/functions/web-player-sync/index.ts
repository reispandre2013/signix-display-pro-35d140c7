import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { jsonResponse, readJson } from "../_shared/http.ts";
import { resolvePlaylistByScreenId } from "../_shared/resolve-playlist-edge.ts";
import { touchWebSession, validateWebSession } from "../_shared/web-player.ts";

type Body = {
  screen_id?: string;
  display_token?: string;
  device_token?: string;
  etag?: string | null;
};

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  try {
    const body = await readJson<Body>(req);
    let screenId = String(body.screen_id ?? "").trim();
    if (!screenId && body.display_token) {
      const { data: byToken } = await adminClient
        .from("screens")
        .select("id, display_token_expires_at")
        .eq("display_token", body.display_token)
        .maybeSingle();
      if (byToken?.id) {
        const exp = byToken.display_token_expires_at
          ? new Date(byToken.display_token_expires_at).getTime()
          : Number.POSITIVE_INFINITY;
        if (Date.now() <= exp) screenId = String(byToken.id);
      }
    }
    if (!screenId) return jsonResponse({ error: "screen_id ou display_token obrigatório." }, 400);
    let ctx: { screenId: string; organizationId: string; sessionId?: string };
    if (body.device_token) {
      const validated = await validateWebSession(screenId, body.device_token);
      await touchWebSession(validated.sessionId);
      ctx = validated;
    } else if (body.display_token) {
      const { data: row, error: rowErr } = await adminClient
        .from("screens")
        .select("id, organization_id, display_token_expires_at")
        .eq("id", screenId)
        .eq("display_token", body.display_token)
        .maybeSingle();
      if (rowErr) return jsonResponse({ error: rowErr.message }, 400);
      if (!row?.id) return jsonResponse({ error: "Token de exibição inválido." }, 401);
      const exp = row.display_token_expires_at
        ? new Date(row.display_token_expires_at).getTime()
        : Number.POSITIVE_INFINITY;
      if (Date.now() > exp) return jsonResponse({ error: "Token de exibição expirado." }, 401);
      ctx = { screenId: String(row.id), organizationId: String(row.organization_id) };
    } else {
      return jsonResponse({ error: "device_token ou display_token obrigatório." }, 400);
    }

    const { data: screen, error: sErr } = await adminClient
      .from("screens")
      .select("id, status")
      .eq("id", ctx.screenId)
      .eq("organization_id", ctx.organizationId)
      .maybeSingle();
    if (sErr) return jsonResponse({ error: sErr.message }, 400);
    if (!screen?.id) return jsonResponse({ error: "Tela não encontrada." }, 404);
    if (String(screen.status ?? "active") !== "active")
      return jsonResponse({ error: "Tela inativa." }, 403);

    const { data: org } = await adminClient
      .from("organizations")
      .select("status")
      .eq("id", ctx.organizationId)
      .maybeSingle();
    if (org?.status === "suspended") {
      return jsonResponse({ error: "Organização suspensa." }, 403);
    }

    const { data: sub } = await adminClient
      .from("subscriptions")
      .select("status")
      .eq("organization_id", ctx.organizationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sub?.status === "past_due" || sub?.status === "canceled") {
      return jsonResponse({ error: "Assinatura suspensa. Player bloqueado." }, 403);
    }
    const { data: lic } = await adminClient
      .from("licenses")
      .select("status")
      .eq("organization_id", ctx.organizationId)
      .order("valid_from", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lic?.status === "suspended" || lic?.status === "expired") {
      return jsonResponse({ error: "Licença inativa. Player bloqueado." }, 403);
    }

    const result = await resolvePlaylistByScreenId(adminClient, ctx.screenId);
    const payload = (result.payload ?? {}) as Record<string, unknown>;
    const version = String(payload.payload_version ?? "v1");
    if (body.etag && body.etag === version) {
      return jsonResponse({ ok: true, unchanged: true, etag: version });
    }
    return jsonResponse({
      ok: true,
      unchanged: false,
      etag: version,
      ...payload,
      sync_interval: payload.sync_interval ?? 90,
      heartbeat_interval: payload.heartbeat_interval ?? 60,
    });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 400);
  }
});

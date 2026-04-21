import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizePlayerPlatform, type PlayerPlatform } from "@/lib/platform-capabilities";
import {
  buildPlaylistEtagFromSeed,
  resolveScreenPlaylistPayload,
  type PlaylistResolutionSource,
  type ScreenPlaylistItemPayload,
} from "@/lib/server/screen-playlist-payload";

function normalizeCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

async function assertScreenCredentials(screenId: string, pairingCode: string) {
  const code = normalizeCode(pairingCode);
  const { data: screen, error } = await supabaseAdmin
    .from("screens")
    .select("id, pairing_code, organization_id")
    .eq("id", screenId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!screen) throw new Error("Tela não encontrada.");
  if (!screen.pairing_code || normalizeCode(screen.pairing_code) !== code) {
    throw new Error("Credenciais do player inválidas.");
  }
  return screen;
}

type HeartbeatInput = {
  screen_id: string;
  pairing_code: string;
  platform?: string;
  app_version?: string | null;
  network_status?: string | null;
  storage_status?: string | null;
  player_status?: string | null;
  current_campaign_id?: string | null;
  current_media_id?: string | null;
  free_storage_mb?: number | null;
  screen_width?: number | null;
  screen_height?: number | null;
};

function validateHeartbeat(input: unknown): HeartbeatInput {
  if (typeof input !== "object" || input === null) throw new Error("Payload inválido.");
  const o = input as Record<string, unknown>;
  if (typeof o.screen_id !== "string" || !o.screen_id) throw new Error("screen_id obrigatório.");
  if (typeof o.pairing_code !== "string" || normalizeCode(o.pairing_code).length < 4)
    throw new Error("pairing_code obrigatório.");
  return {
    screen_id: o.screen_id,
    pairing_code: o.pairing_code as string,
    platform: typeof o.platform === "string" ? o.platform : undefined,
    app_version: typeof o.app_version === "string" ? o.app_version : null,
    network_status: typeof o.network_status === "string" ? o.network_status : null,
    storage_status: typeof o.storage_status === "string" ? o.storage_status : null,
    player_status: typeof o.player_status === "string" ? o.player_status : null,
    current_campaign_id: typeof o.current_campaign_id === "string" ? o.current_campaign_id : null,
    current_media_id: typeof o.current_media_id === "string" ? o.current_media_id : null,
    free_storage_mb: typeof o.free_storage_mb === "number" ? o.free_storage_mb : null,
    screen_width: typeof o.screen_width === "number" ? o.screen_width : null,
    screen_height: typeof o.screen_height === "number" ? o.screen_height : null,
  };
}

/**
 * Heartbeat público (sem JWT). Autenticação fraca por screen_id + pairing_code gravado na screen.
 * Evoluir para device_token dedicado quando possível.
 */
export const postPlayerHeartbeat = createServerFn({ method: "POST" })
  .inputValidator(validateHeartbeat)
  .handler(async ({ data }) => {
    await assertScreenCredentials(data.screen_id, data.pairing_code);
    const platform = normalizePlayerPlatform(data.platform) as PlayerPlatform;
    const now = new Date().toISOString();
    const resolution =
      data.screen_width && data.screen_height
        ? `${Math.round(data.screen_width)}x${Math.round(data.screen_height)}`
        : null;

    const { error: hbErr } = await supabaseAdmin.from("screen_heartbeats").insert({
      screen_id: data.screen_id,
      platform,
      app_version: data.app_version,
      network_status: data.network_status,
      storage_status: data.storage_status,
      player_status: data.player_status,
      current_campaign_id: data.current_campaign_id,
      current_media_id: data.current_media_id,
      free_storage_mb: data.free_storage_mb,
    });
    if (hbErr) {
      console.error("[postPlayerHeartbeat] insert heartbeat:", hbErr.message);
    }

    const patch: Record<string, unknown> = {
      last_seen_at: now,
      is_online: true,
      device_status: "online",
    };
    if (data.app_version) patch.player_version = data.app_version;
    if (resolution) patch.resolution = resolution;

    const { error: upErr } = await supabaseAdmin.from("screens").update(patch).eq("id", data.screen_id);
    if (upErr) throw new Error(upErr.message);

    return { ok: true, server_time: now };
  });

type LogInput = {
  screen_id: string;
  pairing_code: string;
  platform?: string;
  event_type: string;
  severity?: string;
  message?: string | null;
  payload_json?: Record<string, unknown> | null;
};

function validateLog(input: unknown): LogInput {
  if (typeof input !== "object" || input === null) throw new Error("Payload inválido.");
  const o = input as Record<string, unknown>;
  if (typeof o.screen_id !== "string" || !o.screen_id) throw new Error("screen_id obrigatório.");
  if (typeof o.pairing_code !== "string") throw new Error("pairing_code obrigatório.");
  if (typeof o.event_type !== "string" || !o.event_type.trim()) throw new Error("event_type obrigatório.");
  return {
    screen_id: o.screen_id,
    pairing_code: o.pairing_code,
    platform: typeof o.platform === "string" ? o.platform : undefined,
    event_type: o.event_type.trim(),
    severity: typeof o.severity === "string" ? o.severity : "info",
    message: typeof o.message === "string" ? o.message : null,
    payload_json:
      o.payload_json && typeof o.payload_json === "object" && !Array.isArray(o.payload_json)
        ? (o.payload_json as Record<string, unknown>)
        : null,
  };
}

export const postPlayerLog = createServerFn({ method: "POST" })
  .inputValidator(validateLog)
  .handler(async ({ data }) => {
    await assertScreenCredentials(data.screen_id, data.pairing_code);
    const platform = normalizePlayerPlatform(data.platform) as PlayerPlatform;
    const { error } = await supabaseAdmin.from("screen_logs").insert({
      screen_id: data.screen_id,
      platform,
      event_type: data.event_type,
      severity: data.severity ?? "info",
      message: data.message,
      payload_json: data.payload_json,
    });
    if (error) {
      console.error("[postPlayerLog]", error.message);
      throw new Error(error.message);
    }
    return { ok: true };
  });

/* -------------------------------------------------------------------------- */
/* Sync + playlist por screen_id (players Android / Tizen / Web)              */
/* -------------------------------------------------------------------------- */

type GetPlaylistInput = {
  screen_id: string;
  pairing_code: string;
  platform?: string;
  etag?: string | null;
};

function validateGetPlaylist(input: unknown): GetPlaylistInput {
  if (typeof input !== "object" || input === null) throw new Error("Payload inválido.");
  const o = input as Record<string, unknown>;
  if (typeof o.screen_id !== "string" || !o.screen_id) throw new Error("screen_id obrigatório.");
  if (typeof o.pairing_code !== "string") throw new Error("pairing_code obrigatório.");
  return {
    screen_id: o.screen_id,
    pairing_code: o.pairing_code as string,
    platform: typeof o.platform === "string" ? o.platform : undefined,
    etag: typeof o.etag === "string" ? o.etag : null,
  };
}

/** Item normalizado para players (web / Android / Tizen). */
export type ScreenPlaylistItem = ScreenPlaylistItemPayload;

function mapResolutionSourceForPlayer(s: PlaylistResolutionSource): "playlist_items" | "org_media_fallback" | "empty" {
  if (s === "org_media_fallback") return "org_media_fallback";
  if (s === "empty") return "empty";
  return "playlist_items";
}

/**
 * Devolve campanha activa + itens de playlist (ou fallback para mídias da org).
 * Autenticação: screen_id + pairing_code (igual ao gravado na screen após pareamento).
 */
export const getScreenPlaylistPayload = createServerFn({ method: "POST" })
  .inputValidator(validateGetPlaylist)
  .handler(async ({ data }) => {
    await assertScreenCredentials(data.screen_id, data.pairing_code);

    const resolved = await resolveScreenPlaylistPayload(supabaseAdmin, data.screen_id);
    if (!resolved.organization_id) throw new Error("Tela não encontrada.");

    const items = resolved.items;
    const etag = buildPlaylistEtagFromSeed(resolved.etagSeed + `:${items.length}`);
    if (data.etag && data.etag === etag) {
      return {
        ok: true as const,
        unchanged: true as const,
        etag,
        server_time: new Date().toISOString(),
      };
    }

    const source = mapResolutionSourceForPlayer(resolved.source);

    return {
      ok: true as const,
      unchanged: false as const,
      etag,
      server_time: new Date().toISOString(),
      screen: {
        id: resolved.screen.id,
        name: resolved.screen.name,
        organization_id: resolved.organization_id,
        platform: resolved.screen.platform ?? "android",
        store_type: resolved.screen.store_type ?? null,
        ...resolved.display,
      },
      campaign: resolved.campaign,
      playlist: resolved.playlist
        ? { id: resolved.playlist.id, name: resolved.playlist.name, version: resolved.playlist.version }
        : null,
      playlist_version: resolved.playlist?.version ?? null,
      items,
      source,
      resolution_source: resolved.source,
    };
  });

type SyncAckInput = {
  screen_id: string;
  pairing_code: string;
  platform?: string;
  sync_type: string;
  sync_status: string;
  items_downloaded?: number | null;
  error_message?: string | null;
};

function validateSyncAck(input: unknown): SyncAckInput {
  if (typeof input !== "object" || input === null) throw new Error("Payload inválido.");
  const o = input as Record<string, unknown>;
  if (typeof o.screen_id !== "string" || !o.screen_id) throw new Error("screen_id obrigatório.");
  if (typeof o.pairing_code !== "string") throw new Error("pairing_code obrigatório.");
  if (typeof o.sync_type !== "string" || !o.sync_type.trim()) throw new Error("sync_type obrigatório.");
  if (typeof o.sync_status !== "string" || !o.sync_status.trim()) throw new Error("sync_status obrigatório.");
  return {
    screen_id: o.screen_id,
    pairing_code: o.pairing_code as string,
    platform: typeof o.platform === "string" ? o.platform : undefined,
    sync_type: o.sync_type.trim(),
    sync_status: o.sync_status.trim(),
    items_downloaded: typeof o.items_downloaded === "number" ? o.items_downloaded : null,
    error_message: typeof o.error_message === "string" ? o.error_message : null,
  };
}

/** Regista conclusão de sync + actualiza `last_sync_at` na screen. */
export const postPlayerSyncAck = createServerFn({ method: "POST" })
  .inputValidator(validateSyncAck)
  .handler(async ({ data }) => {
    await assertScreenCredentials(data.screen_id, data.pairing_code);
    const platform = normalizePlayerPlatform(data.platform) as PlayerPlatform;
    const now = new Date().toISOString();

    const { error: insErr } = await supabaseAdmin.from("screen_sync_history").insert({
      screen_id: data.screen_id,
      platform,
      sync_type: data.sync_type,
      sync_status: data.sync_status,
      items_downloaded: data.items_downloaded,
      started_at: now,
      finished_at: now,
      error_message: data.error_message,
    });
    if (insErr) console.error("[postPlayerSyncAck] history:", insErr.message);

    const { error: upErr } = await supabaseAdmin
      .from("screens")
      .update({
        last_sync_at: now,
        device_status: data.sync_status === "failed" ? "warning" : "online",
      })
      .eq("id", data.screen_id);
    if (upErr) throw new Error(upErr.message);

    return { ok: true, server_time: now };
  });

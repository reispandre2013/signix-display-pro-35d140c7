import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { readJson } from "../_shared/http.ts";
import {
  buildPlaylistEtagFromSeed,
  resolveScreenPlaylistPayload,
  type ScreenPlaylistItemPayload,
} from "../_shared/screen-playlist-payload.ts";

type ResolvePayload = {
  screenId?: string | null;
  screen_id?: string | null;
  pairingCode?: string | null;
  pairing_code?: string | null;
  code?: string | null;
};

const corsJsonHeaders: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsJsonHeaders });
}

function normalizeScreenId(raw: string | null | undefined): string {
  return String(raw ?? "").trim();
}

function normalizeCode(raw: string | null | undefined): string {
  return String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

async function resolveLegacyScreenIdByPairingCode(code: string): Promise<string> {
  if (!code) return "";
  const { data: screen, error } = await adminClient.from("screens").select("id").eq("pairing_code", code).maybeSingle();
  if (error) throw new Error(error.message);
  return screen?.id ? String(screen.id) : "";
}

type ResolveResult = {
  success: boolean;
  playlist: unknown[];
  screen: unknown | null;
  message: string;
  payload: unknown;
};

function extractItems(payload: unknown): unknown[] {
  return Array.isArray((payload as { items?: unknown[] } | null)?.items)
    ? (((payload as { items?: unknown[] }).items ?? []) as unknown[])
    : [];
}

function mapItemToEdge(it: ScreenPlaylistItemPayload) {
  return {
    id: it.id,
    media_asset_id: it.media_asset_id,
    media_type: it.media_type,
    media_url: it.public_url ?? "",
    thumbnail_url: it.thumbnail_url,
    duration_seconds: it.duration_seconds ?? 8,
    position: it.position,
    fit_mode: it.fit_mode,
    fit_mode_effective: it.fit_mode_effective,
    is_active: it.is_active,
    transition_type: "fade",
    checksum: `${it.media_asset_id}:${it.position}`,
    metadata: {
      media_name: it.name,
      category: null,
      tags: [],
    },
  };
}

async function refreshPayloadMediaUrls(payload: unknown, organizationId: string): Promise<unknown> {
  const payloadObj = (payload ?? null) as { items?: unknown[] } | null;
  const items = Array.isArray(payloadObj?.items) ? (payloadObj?.items ?? []) : [];
  if (items.length === 0) return payload;

  const mediaIds = Array.from(
    new Set(
      items
        .map((it) => String((it as { media_asset_id?: string }).media_asset_id ?? ""))
        .filter((id) => id.length > 0),
    ),
  );
  if (mediaIds.length === 0) return payload;

  const { data: medias, error } = await adminClient
    .from("media_assets")
    .select(
      "id, name, file_type, category, tags, public_url, file_path, thumbnail_url, duration_seconds, mime_type, status, valid_from, valid_until, updated_at",
    )
    .in("id", mediaIds)
    .eq("organization_id", organizationId);
  if (error) throw new Error(error.message);

  const mediaRows = (medias ?? []) as Array<{ id: string; file_path: string; public_url: string | null; updated_at: string | null }>;
  const storageMediaBuckets = new Set(["media-images", "media-videos", "thumbnails"]);

  async function signedUrlForPath(filePath: string): Promise<string | null> {
    const path = String(filePath ?? "").trim();
    if (!path || /^https?:\/\//i.test(path)) return null;
    const slash = path.indexOf("/");
    if (slash <= 0) return null;
    const bucket = path.slice(0, slash);
    const objectPath = path.slice(slash + 1);
    if (!storageMediaBuckets.has(bucket) || !objectPath) return null;
    const { data, error: suErr } = await adminClient.storage.from(bucket).createSignedUrl(objectPath, 60 * 60);
    if (!suErr && data?.signedUrl) return data.signedUrl;
    return null;
  }

  const urlPairs = await Promise.all(
    mediaRows.map(async (media) => ({
      mediaId: media.id,
      url: (await signedUrlForPath(media.file_path)) ?? media.public_url ?? media.file_path ?? "",
    })),
  );
  const urlByMediaId = new Map<string, string>(urlPairs.map((p) => [p.mediaId, p.url]));

  return {
    ...(payloadObj ?? {}),
    items: items.map((item) => {
      const mediaId = String((item as { media_asset_id?: string }).media_asset_id ?? "");
      const nextUrl = urlByMediaId.get(mediaId);
      if (!nextUrl) return item;
      return { ...(item as Record<string, unknown>), media_url: nextUrl };
    }),
  };
}

async function resolveScreenIdFromInput(body: ResolvePayload): Promise<string> {
  const byId = normalizeScreenId(body.screenId ?? body.screen_id ?? null);
  if (byId) return byId;

  const code = normalizeCode(body.pairingCode ?? body.pairing_code ?? body.code ?? null);
  if (!code) return "";

  const { data: pairing, error } = await adminClient
    .from("pairing_codes")
    .select("screen_id, used_at")
    .eq("code", code)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (pairing?.screen_id && pairing?.used_at) return String(pairing.screen_id);

  const legacyScreenId = await resolveLegacyScreenIdByPairingCode(code);
  if (!legacyScreenId) return "";

  await adminClient
    .from("pairing_codes")
    .update({
      screen_id: legacyScreenId,
      used_at: pairing?.used_at ?? new Date().toISOString(),
    })
    .eq("code", code)
    .is("screen_id", null);

  return legacyScreenId;
}

async function resolvePlaylistByScreenId(screenId: string): Promise<ResolveResult> {
  if (!screenId) {
    return {
      success: true,
      playlist: [],
      screen: null,
      message: "Tela ainda não vinculada ao código de pareamento.",
      payload: null,
    };
  }

  const resolved = await resolveScreenPlaylistPayload(adminClient, screenId);
  if (!resolved.organization_id) {
    return {
      success: true,
      playlist: [],
      screen: null,
      message: "Tela não encontrada.",
      payload: null,
    };
  }

  const basePayload = {
    screen_id: resolved.screen.id,
    organization_id: resolved.organization_id,
    campaign_id: resolved.campaign?.id ?? null,
    playlist_id: resolved.playlist?.id ?? null,
    playlist_version: resolved.playlist?.version ?? null,
    resolution_source: resolved.source,
    payload_version: buildPlaylistEtagFromSeed(resolved.etagSeed),
    valid_until: null,
    priority: resolved.campaign?.priority ?? null,
    orientation: resolved.display.orientation,
    resolution: resolved.display.resolution,
    screen_width: resolved.display.screen_width,
    screen_height: resolved.display.screen_height,
    aspect_ratio: resolved.display.aspect_ratio,
    default_fit_mode: resolved.display.default_fit_mode,
    auto_scale_video: resolved.display.auto_scale_video,
    auto_scale_image: resolved.display.auto_scale_image,
    hide_overlay: resolved.display.hide_overlay,
    hide_controls: resolved.display.hide_controls,
    items: resolved.items.map(mapItemToEdge),
  };

  const payload = await refreshPayloadMediaUrls(basePayload, resolved.organization_id);
  const playlist = extractItems(payload);

  return {
    success: true,
    playlist,
    screen: {
      id: resolved.screen.id,
      name: resolved.screen.name,
      organization_id: resolved.organization_id,
      platform: resolved.screen.platform,
      store_type: resolved.screen.store_type,
      ...resolved.display,
    },
    message: playlist.length > 0 ? "Playlist carregada" : "Nenhum item ativo encontrado para esta tela.",
    payload,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson<ResolvePayload>(req).catch(() => ({} as ResolvePayload));
    const screenId = await resolveScreenIdFromInput(body);
    const result = await resolvePlaylistByScreenId(screenId);
    return jsonResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

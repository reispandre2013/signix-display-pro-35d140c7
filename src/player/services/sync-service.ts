import { mockMedia } from "@/lib/mock-data";
import { hasSupabaseEnv } from "@/integrations/supabase/client";
import { cacheMediaItems } from "@/player/services/media-cache";
import { resolveScreenPayload } from "@/player/services/player-api";
import { getCachedPayload, setCachedPayload } from "@/player/storage/player-local";
import type { PlayerPayload } from "@/player/types";
import { validatePayload } from "@/player/validators/payload-validator";

function mockPayload(screenId: string): PlayerPayload {
  const items = mockMedia
    .filter((m) => m.type === "imagem" || m.type === "banner" || m.type === "vídeo")
    .slice(0, 8)
    .map((media, index) => ({
      id: `${media.id}-${index}`,
      media_asset_id: media.id,
      media_type: media.type === "vídeo" ? "video" : "image",
      media_url: media.url,
      thumbnail_url: media.thumb,
      duration_seconds: Math.max(5, media.duration),
      position: index + 1,
      transition_type: "fade",
      checksum: `${media.id}:${media.url}`,
      metadata: {},
    }));

  return {
    screen_id: screenId,
    organization_id: "mock-org",
    campaign_id: "mock-campaign",
    playlist_id: "mock-playlist",
    payload_version: `mock-${Date.now()}`,
    valid_until: null,
    items,
  };
}

export async function syncPlayerPayload(
  screenId: string,
): Promise<{ payload: PlayerPayload; fromCache: boolean }> {
  if (!hasSupabaseEnv) {
    const fallback = mockPayload(screenId);
    await cacheMediaItems(fallback.items);
    await setCachedPayload(fallback);
    return { payload: fallback, fromCache: true };
  }

  try {
    const payload = validatePayload(await resolveScreenPayload(screenId));
    await cacheMediaItems(payload.items);
    await setCachedPayload(payload);
    return { payload, fromCache: false };
  } catch (error) {
    const cached = await getCachedPayload();
    if (cached) {
      return { payload: validatePayload(cached), fromCache: true };
    }

    throw error;
  }
}

import { idbStore } from "@/player/storage/idb";
import type { PlaylistItemPayload } from "@/player/types";

function mediaCacheKey(item: PlaylistItemPayload): string {
  return item.checksum ?? `${item.media_asset_id}:${item.media_url}`;
}

export async function cacheMediaItems(items: PlaylistItemPayload[]): Promise<void> {
  await Promise.all(
    items.map(async (item) => {
      try {
        const response = await fetch(item.media_url, { cache: "force-cache" });
        if (!response.ok) return;
        const blob = await response.blob();
        await idbStore.setMedia(mediaCacheKey(item), blob);
      } catch {
        // Ignore individual media errors to avoid blocking player sync.
      }
    }),
  );
}

export async function getCachedMediaUrl(item: PlaylistItemPayload): Promise<string | null> {
  const blob = await idbStore.getMedia(mediaCacheKey(item));
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

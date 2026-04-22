import { hasSupabaseEnv } from "@/lib/supabase-client";
import { cacheMediaItems } from "@/player/services/media-cache";
import { resolvePlaylistWithDevice, resolveScreenPayload } from "@/player/services/player-api";
import { getCachedPayload, setCachedPayload } from "@/player/storage/player-local";
import type { LocalScreenCredentials, PlayerPayload } from "@/player/types";
import { validatePayload } from "@/player/validators/payload-validator";

export async function syncPlayerPayload(
  credentials: LocalScreenCredentials | { screenId: string },
): Promise<{ payload: PlayerPayload; fromCache: boolean }> {
  const screenId = credentials.screenId;
  const useDevice =
    "deviceId" in credentials &&
    Boolean(credentials.deviceId) &&
    "authToken" in credentials &&
    Boolean(credentials.authToken);

  if (!hasSupabaseEnv) {
    const empty: PlayerPayload = {
      screen_id: screenId,
      organization_id: "",
      campaign_id: null,
      playlist_id: null,
      payload_version: "offline-preview",
      valid_until: null,
      items: [],
    };
    return { payload: empty, fromCache: true };
  }

  try {
    const payload = useDevice
      ? await resolvePlaylistWithDevice(credentials.deviceId as string, credentials.authToken as string)
      : await resolveScreenPayload(screenId);
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

import { idbStore } from "@/player/storage/idb";
import { sendPlaybackLog } from "@/player/services/player-api";
import type { PlaybackLog } from "@/player/types";

export async function queuePlaybackLog(log: PlaybackLog): Promise<void> {
  await idbStore.setLog(log);
}

export async function flushQueuedLogs(): Promise<void> {
  const logs = await idbStore.getAllLogs<PlaybackLog>();
  for (const log of logs) {
    try {
      await sendPlaybackLog(log);
      await idbStore.deleteLog(log.id);
    } catch {
      // Keep queued and try later.
      break;
    }
  }
}

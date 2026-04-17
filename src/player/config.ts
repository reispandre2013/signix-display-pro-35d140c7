import type { PlayerSettings } from "@/player/types";

export const PLAYER_STORAGE_KEYS = {
  credentials: "signix.player.credentials",
  settings: "signix.player.settings",
  payload: "signix.player.payload",
  lastError: "signix.player.last-error",
} as const;

export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  orientation: "auto",
  defaultVolume: 0.6,
  heartbeatSeconds: 30,
  syncSeconds: 120,
  debugMode: false,
};

export const PLAYER_FALLBACK_MESSAGE =
  "Sem programação disponível no momento. O player continuará tentando sincronizar automaticamente.";

/**
 * Configuração derivada por plataforma do player.
 * Centraliza defaults para evitar if/else espalhado no painel ou nos players.
 */

export type PlayerPlatform = "android" | "tizen" | "web";

export type PlayerCapabilities = {
  platform: PlayerPlatform;
  supportsOfflineCache: boolean;
  supportsVideo: boolean;
  supportsImage: boolean;
  activationMode: "code_pairing";
  heartbeatIntervalSec: number;
  storeTypeHint: "playstore" | "tizen" | "sideload" | "internal";
};

const defaults: Record<PlayerPlatform, PlayerCapabilities> = {
  android: {
    platform: "android",
    supportsOfflineCache: true,
    supportsVideo: true,
    supportsImage: true,
    activationMode: "code_pairing",
    heartbeatIntervalSec: 60,
    storeTypeHint: "internal",
  },
  tizen: {
    platform: "tizen",
    supportsOfflineCache: true,
    supportsVideo: true,
    supportsImage: true,
    activationMode: "code_pairing",
    heartbeatIntervalSec: 60,
    storeTypeHint: "tizen",
  },
  web: {
    platform: "web",
    supportsOfflineCache: false,
    supportsVideo: true,
    supportsImage: true,
    activationMode: "code_pairing",
    heartbeatIntervalSec: 120,
    storeTypeHint: "internal",
  },
};

export function normalizePlayerPlatform(raw: string | null | undefined): PlayerPlatform {
  const p = (raw ?? "android").toLowerCase().trim();
  if (p === "tizen") return "tizen";
  if (p === "web") return "web";
  return "android";
}

export function getPlayerCapabilities(platform: string | null | undefined): PlayerCapabilities {
  return defaults[normalizePlayerPlatform(platform)];
}

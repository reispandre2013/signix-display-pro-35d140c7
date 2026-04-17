import { DEFAULT_PLAYER_SETTINGS, PLAYER_STORAGE_KEYS } from "@/player/config";
import { idbStore } from "@/player/storage/idb";
import type { LocalScreenCredentials, PlayerPayload, PlayerSettings } from "@/player/types";

export async function getCredentials(): Promise<LocalScreenCredentials | null> {
  const value = await idbStore.getKv<LocalScreenCredentials>(PLAYER_STORAGE_KEYS.credentials);
  return value ?? null;
}

export async function setCredentials(value: LocalScreenCredentials): Promise<void> {
  await idbStore.setKv(PLAYER_STORAGE_KEYS.credentials, value);
}

export async function clearCredentials(): Promise<void> {
  await idbStore.deleteKv(PLAYER_STORAGE_KEYS.credentials);
}

export async function getCachedPayload(): Promise<PlayerPayload | null> {
  const value = await idbStore.getKv<PlayerPayload>(PLAYER_STORAGE_KEYS.payload);
  return value ?? null;
}

export async function setCachedPayload(payload: PlayerPayload): Promise<void> {
  await idbStore.setKv(PLAYER_STORAGE_KEYS.payload, payload);
}

export function getSettings(): PlayerSettings {
  const raw = localStorage.getItem(PLAYER_STORAGE_KEYS.settings);
  if (!raw) return DEFAULT_PLAYER_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<PlayerSettings>;
    return {
      ...DEFAULT_PLAYER_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_PLAYER_SETTINGS;
  }
}

export function setSettings(settings: PlayerSettings): void {
  localStorage.setItem(PLAYER_STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function setLastError(message: string): void {
  localStorage.setItem(PLAYER_STORAGE_KEYS.lastError, message);
}

export function getLastError(): string | null {
  return localStorage.getItem(PLAYER_STORAGE_KEYS.lastError);
}

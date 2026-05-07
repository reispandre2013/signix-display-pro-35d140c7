/**
 * Persistência de credenciais do player Android (Capacitor Preferences).
 *
 * O APK Android usa o MESMO fluxo de pareamento por código que Tizen/Web:
 * o usuário gera um código no app, vincula no painel admin, e o servidor
 * devolve { device_id, auth_token } persistentes (não expiram).
 *
 * Para sobreviver a updates do APK / limpeza de WebView storage, espelhamos
 * essas credenciais em Capacitor Preferences (armazenamento nativo).
 */
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const KEY_TOKEN = "signix.android.auth_token";
const KEY_DEVICE_ID = "signix.android.device_id";
const KEY_SCREEN_ID = "signix.android.screen_id";

export function isAndroidNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

export async function saveAndroidSession(
  screen_id: string,
  device_id: string,
  auth_token: string,
): Promise<void> {
  if (!isAndroidNative()) return;
  await Promise.all([
    Preferences.set({ key: KEY_SCREEN_ID, value: screen_id }),
    Preferences.set({ key: KEY_DEVICE_ID, value: device_id }),
    Preferences.set({ key: KEY_TOKEN, value: auth_token }),
  ]);
}

export async function getStoredAndroidSession(): Promise<{
  screen_id: string;
  device_id: string;
  auth_token: string;
} | null> {
  if (!isAndroidNative()) return null;
  const [sid, did, tok] = await Promise.all([
    Preferences.get({ key: KEY_SCREEN_ID }),
    Preferences.get({ key: KEY_DEVICE_ID }),
    Preferences.get({ key: KEY_TOKEN }),
  ]);
  if (!sid.value || !did.value || !tok.value) return null;
  return { screen_id: sid.value, device_id: did.value, auth_token: tok.value };
}

export async function clearStoredAndroidSession(): Promise<void> {
  if (!isAndroidNative()) return;
  await Promise.all([
    Preferences.remove({ key: KEY_TOKEN }),
    Preferences.remove({ key: KEY_SCREEN_ID }),
    Preferences.remove({ key: KEY_DEVICE_ID }),
  ]);
}

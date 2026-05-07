import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { Device } from "@capacitor/device";

const KEY_UUID = "signix.android.device_uuid";
const KEY_TOKEN = "signix.android.auth_token";
const KEY_DEVICE_ID = "signix.android.device_id";
const KEY_SCREEN_ID = "signix.android.screen_id";

export function isAndroidNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

async function getOrCreateUuid(): Promise<string> {
  const cur = await Preferences.get({ key: KEY_UUID });
  if (cur.value) return cur.value;
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await Preferences.set({ key: KEY_UUID, value: uuid });
  return uuid;
}

async function getStored(key: string): Promise<string | null> {
  const r = await Preferences.get({ key });
  return r.value ?? null;
}

async function setStored(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value });
}

export type AndroidPairState =
  | { status: "pending"; device_uuid: string; device_id: string }
  | {
      status: "active";
      device_uuid: string;
      device_id: string;
      screen_id: string;
      auth_token: string;
    }
  | { status: "blocked"; device_uuid: string; device_id?: string };

// APIs públicas devem ser chamadas no domínio custom — o domínio *.lovable.app
// faz 302 redirect cross-origin em POSTs e o WebView Android não preserva o body.
const API_BASE = "https://sigplayer.com.br";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return (await res.json()) as T;
}

export async function autoRegisterAndroid(): Promise<AndroidPairState> {
  const uuid = await getOrCreateUuid();
  let info: { manufacturer?: string; model?: string; osVersion?: string } = {};
  try {
    const d = await Device.getInfo();
    info = { manufacturer: d.manufacturer, model: d.model, osVersion: d.osVersion };
  } catch {
    // ignore
  }

  const reg = await postJson<{
    status: "pending" | "active" | "blocked";
    device_id: string;
    screen_id?: string;
  }>("/api/public/devices/auto-register", {
    device_uuid: uuid,
    app_version: "1.0.0",
    tv_model: info.model ?? "Android TV",
    manufacturer: info.manufacturer ?? "unknown",
    platform: "android_tv",
  });

  await setStored(KEY_DEVICE_ID, reg.device_id);

  // Tenta resgatar sessão (token entregue uma vez após ativação).
  const token = await getStored(KEY_TOKEN);
  const session = await postJson<{
    status: string;
    device_id?: string;
    screen_id?: string;
    token?: string;
  }>("/api/public/devices/check-session", {
    device_uuid: uuid,
    token: token ?? "",
  });

  if (session.status === "active" && session.screen_id) {
    const finalToken = session.token ?? token ?? "";
    if (session.token) await setStored(KEY_TOKEN, session.token);
    await setStored(KEY_SCREEN_ID, session.screen_id);
    return {
      status: "active",
      device_uuid: uuid,
      device_id: session.device_id ?? reg.device_id,
      screen_id: session.screen_id,
      auth_token: finalToken,
    };
  }

  if (session.status === "blocked") {
    return { status: "blocked", device_uuid: uuid, device_id: reg.device_id };
  }

  return { status: "pending", device_uuid: uuid, device_id: reg.device_id };
}

/** Polling: chama check-session periodicamente até ficar active. */
export async function pollUntilActive(
  uuid: string,
  onTick?: (s: AndroidPairState) => void,
  intervalMs = 10_000,
): Promise<AndroidPairState> {
  while (true) {
    const token = await getStored(KEY_TOKEN);
    type SessRes = {
      status: string;
      device_id?: string;
      screen_id?: string;
      token?: string;
    };
    const r: SessRes = await postJson<SessRes>("/api/public/devices/check-session", {
      device_uuid: uuid,
      token: token ?? "",
    }).catch(() => ({ status: "error" }) as SessRes);

    if (r.status === "active" && r.screen_id) {
      const finalToken = r.token ?? token ?? "";
      if (r.token) await setStored(KEY_TOKEN, r.token);
      await setStored(KEY_SCREEN_ID, r.screen_id);
      const state: AndroidPairState = {
        status: "active",
        device_uuid: uuid,
        device_id: r.device_id ?? "",
        screen_id: r.screen_id,
        auth_token: finalToken,
      };
      onTick?.(state);
      return state;
    }
    if (r.status === "blocked") {
      const state: AndroidPairState = { status: "blocked", device_uuid: uuid };
      onTick?.(state);
      return state;
    }
    onTick?.({ status: "pending", device_uuid: uuid, device_id: r.device_id ?? "" });
    await new Promise((res) => setTimeout(res, intervalMs));
  }
}

/** Limpa token + screen + device_id (mantém UUID) para forçar nova ativação. */
export async function clearStoredAndroidSession(): Promise<void> {
  await Promise.all([
    Preferences.remove({ key: KEY_TOKEN }),
    Preferences.remove({ key: KEY_SCREEN_ID }),
    Preferences.remove({ key: KEY_DEVICE_ID }),
  ]);
}

export async function getStoredAndroidSession(): Promise<{
  device_uuid: string;
  screen_id: string;
  auth_token: string;
  device_id: string;
} | null> {
  const [uuid, sid, tok, did] = await Promise.all([
    getStored(KEY_UUID),
    getStored(KEY_SCREEN_ID),
    getStored(KEY_TOKEN),
    getStored(KEY_DEVICE_ID),
  ]);
  if (!uuid || !sid || !tok || !did) return null;
  return { device_uuid: uuid, screen_id: sid, auth_token: tok, device_id: did };
}

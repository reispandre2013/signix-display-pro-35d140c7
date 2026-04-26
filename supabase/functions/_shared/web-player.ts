import { adminClient } from "./client.ts";
import { sha256Hex } from "./device-auth.ts";

export type WebSessionContext = {
  screenId: string;
  organizationId: string;
  sessionId: string;
};

function nowIso() {
  return new Date().toISOString();
}

export function randomToken(size = 48): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  const arr = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < arr.length; i += 1) out += chars[arr[i] % chars.length];
  return out;
}

export function browserFromUserAgent(ua: string): { name: string; version: string } {
  const src = ua || "";
  const checks: Array<{ key: string; rx: RegExp }> = [
    { key: "Edge", rx: /Edg\/([\d.]+)/i },
    { key: "Chrome", rx: /Chrome\/([\d.]+)/i },
    { key: "Firefox", rx: /Firefox\/([\d.]+)/i },
    { key: "Safari", rx: /Version\/([\d.]+).*Safari/i },
  ];
  for (const c of checks) {
    const m = src.match(c.rx);
    if (m?.[1]) return { name: c.key, version: m[1] };
  }
  return { name: "Unknown", version: "" };
}

export async function validateWebSession(
  screenId: string,
  deviceToken: string,
): Promise<WebSessionContext> {
  const tokenHash = await sha256Hex(deviceToken);
  const { data: session, error } = await adminClient
    .from("web_player_sessions")
    .select("id, screen_id, organization_id, status, revoked_at")
    .eq("screen_id", screenId)
    .eq("device_token_hash", tokenHash)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!session?.id) throw new Error("Sessão web não encontrada.");
  if (session.status !== "active" || session.revoked_at) {
    throw new Error("Dispositivo não autorizado.");
  }
  return {
    screenId: String(session.screen_id),
    organizationId: String(session.organization_id),
    sessionId: String(session.id),
  };
}

export async function touchWebSession(sessionId: string) {
  await adminClient
    .from("web_player_sessions")
    .update({ last_seen_at: nowIso(), updated_at: nowIso() })
    .eq("id", sessionId);
}

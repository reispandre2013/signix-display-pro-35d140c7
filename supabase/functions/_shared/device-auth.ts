/** Token opaco do player (32 bytes hex). */
export function generatePlayerAuthToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function normalizeDevicePairingCode(raw: string | null | undefined): string {
  return String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[·•‧]/g, "-")
    .replace(/_/g, "-");
}

export function hashPrefixForAudit(hashHex: string, len = 16): string {
  return hashHex.slice(0, len);
}

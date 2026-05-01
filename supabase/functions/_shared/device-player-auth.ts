import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { sha256Hex } from "./device-auth.ts";

/**
 * Resolve `screen_id` a partir de `device_id` + `auth_token` (mesma regra que `device-resolve-playlist`).
 * Lança Error com mensagem segura para o cliente.
 */
export async function assertDevicePlayerForScreen(
  adminClient: SupabaseClient,
  deviceId: string,
  authToken: string,
): Promise<{ screen_id: string; device_row_id: string }> {
  const id = deviceId.trim();
  const tok = authToken.trim();
  if (!id || !tok) throw new Error("device_id e auth_token são obrigatórios.");

  const { data: dev, error: devErr } = await adminClient
    .from("player_devices")
    .select("id, screen_id, auth_secret_hash, pairing_status")
    .eq("id", id)
    .maybeSingle();

  if (devErr) throw new Error(devErr.message);
  if (!dev?.screen_id) throw new Error("Dispositivo não encontrado.");

  const presentedHash = await sha256Hex(tok);
  if (!dev.auth_secret_hash || dev.auth_secret_hash !== presentedHash) {
    throw new Error("Token inválido ou revogado.");
  }
  if (dev.pairing_status !== "active") {
    throw new Error("Dispositivo pendente de novo pareamento.");
  }

  return { screen_id: String(dev.screen_id), device_row_id: String(dev.id) };
}

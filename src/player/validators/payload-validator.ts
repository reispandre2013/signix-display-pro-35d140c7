import { z } from "zod";
import type { PlayerPayload } from "@/player/types";

const playlistItemSchema = z.object({
  id: z.string(),
  media_asset_id: z.string(),
  media_type: z.enum(["image", "video", "banner", "html"]),
  media_url: z.string().url(),
  thumbnail_url: z.string().url().nullable().optional(),
  duration_seconds: z.number().int().min(1),
  position: z.number().int().min(1),
  transition_type: z.string().nullable().optional(),
  checksum: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const playerPayloadSchema = z.object({
  screen_id: z.string(),
  organization_id: z.string(),
  campaign_id: z.string(),
  playlist_id: z.string(),
  payload_version: z.string(),
  valid_until: z.string().nullable().optional(),
  priority: z.number().optional(),
  items: z.array(playlistItemSchema).min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export function validatePayload(payload: unknown): PlayerPayload {
  return playerPayloadSchema.parse(payload);
}

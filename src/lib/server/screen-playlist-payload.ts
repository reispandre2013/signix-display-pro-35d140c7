import type { SupabaseClient } from "@supabase/supabase-js";

export type ScreenDisplayPayload = {
  orientation: string;
  resolution: string | null;
  screen_width: number | null;
  screen_height: number | null;
  aspect_ratio: string | null;
  default_fit_mode: string;
  auto_scale_video: boolean;
  auto_scale_image: boolean;
  hide_overlay: boolean;
  hide_controls: boolean;
};

export type ScreenPlaylistItemPayload = {
  id: string;
  playlist_item_id: string | null;
  media_asset_id: string;
  name: string;
  public_url: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
  media_type: "video" | "html" | "banner" | "image";
  duration_seconds: number | null;
  position: number;
  fit_mode: string | null;
  fit_mode_effective: string;
  is_active: boolean;
};

export type PlaylistResolutionSource =
  | "screen_playlist_assignment"
  | "screen_group_playlist_assignment"
  | "campaign_emergency"
  | "campaign_playlist"
  | "org_media_fallback"
  | "empty";

export type ResolvedScreenPlaylist = {
  organization_id: string;
  screen: { id: string; name: string; platform: string | null; store_type: string | null };
  items: ScreenPlaylistItemPayload[];
  source: PlaylistResolutionSource;
  campaign: { id: string; name: string; playlist_id: string; priority: number } | null;
  playlist: { id: string; name: string; version: number } | null;
  display: ScreenDisplayPayload;
  etagSeed: string;
};

type ScreenRow = ScreenDisplayPayload & {
  id: string;
  organization_id: string;
  name: string;
  unit_id: string | null;
  platform: string | null;
  store_type: string | null;
  updated_at: string | null;
};

type CampaignRow = {
  id: string;
  organization_id: string;
  name: string;
  playlist_id: string;
  priority: number;
  start_at: string;
  end_at: string;
  status: string;
};

const storageMediaBuckets = new Set(["media-images", "media-videos", "thumbnails"]);

export function parseStorageObjectPath(rawPath: string | null | undefined): { bucket: string; objectPath: string } | null {
  const path = String(rawPath ?? "").trim();
  if (!path || /^https?:\/\//i.test(path)) return null;
  const slash = path.indexOf("/");
  if (slash <= 0) return null;
  const bucket = path.slice(0, slash);
  const objectPath = path.slice(slash + 1);
  if (!storageMediaBuckets.has(bucket) || !objectPath) return null;
  return { bucket, objectPath };
}

export async function resolvePlayableMediaUrl(
  client: SupabaseClient,
  filePath: string | null | undefined,
  publicUrl: string | null | undefined,
): Promise<string | null> {
  const objectRef = parseStorageObjectPath(filePath);
  if (objectRef) {
    const { data, error } = await client.storage.from(objectRef.bucket).createSignedUrl(objectRef.objectPath, 60 * 60);
    if (!error && data?.signedUrl) return data.signedUrl;
  }
  return publicUrl ?? filePath ?? null;
}

function campaignActiveNow(c: CampaignRow): boolean {
  if (c.status !== "active") return false;
  const now = Date.now();
  return new Date(c.start_at).getTime() <= now && now <= new Date(c.end_at).getTime();
}

function assignmentWindowActive(row: { start_at: string | null; end_at: string | null }, at: Date): boolean {
  if (row.start_at && new Date(row.start_at).getTime() > at.getTime()) return false;
  if (row.end_at && new Date(row.end_at).getTime() < at.getTime()) return false;
  return true;
}

/** Maior valor ganha: atribuição directa > grupo > campanha. */
function scoreTierSource(source: PlaylistResolutionSource): number {
  if (source === "screen_playlist_assignment") return 3_000_000;
  if (source === "screen_group_playlist_assignment") return 2_000_000;
  if (source === "campaign_emergency") return 1_500_000;
  if (source === "campaign_playlist") return 1_000_000;
  return 0;
}

function effectiveScore(source: PlaylistResolutionSource, priority: number): number {
  return scoreTierSource(source) + Math.max(0, Math.min(100, priority));
}

async function loadScreenRow(client: SupabaseClient, screenId: string): Promise<ScreenRow | null> {
  const { data, error } = await client
    .from("screens")
    .select(
      "id, name, organization_id, unit_id, platform, store_type, updated_at, orientation, resolution, screen_width, screen_height, aspect_ratio, default_fit_mode, auto_scale_video, auto_scale_image, hide_overlay, hide_controls",
    )
    .eq("id", screenId)
    .maybeSingle();
  if (error || !data) return null;
  const s = data as Record<string, unknown>;
  return {
    id: String(s.id),
    name: String(s.name ?? ""),
    organization_id: String(s.organization_id),
    unit_id: (s.unit_id as string | null) ?? null,
    platform: (s.platform as string | null) ?? null,
    store_type: (s.store_type as string | null) ?? null,
    updated_at: (s.updated_at as string | null) ?? null,
    orientation: String(s.orientation ?? "horizontal"),
    resolution: (s.resolution as string | null) ?? null,
    screen_width: typeof s.screen_width === "number" ? s.screen_width : null,
    screen_height: typeof s.screen_height === "number" ? s.screen_height : null,
    aspect_ratio: (s.aspect_ratio as string | null) ?? null,
    default_fit_mode: String(s.default_fit_mode ?? "cover"),
    auto_scale_video: Boolean(s.auto_scale_video ?? true),
    auto_scale_image: Boolean(s.auto_scale_image ?? true),
    hide_overlay: Boolean(s.hide_overlay ?? true),
    hide_controls: Boolean(s.hide_controls ?? true),
  };
}

function displayFromScreen(s: ScreenRow): ScreenDisplayPayload {
  return {
    orientation: s.orientation,
    resolution: s.resolution,
    screen_width: s.screen_width,
    screen_height: s.screen_height,
    aspect_ratio: s.aspect_ratio,
    default_fit_mode: s.default_fit_mode,
    auto_scale_video: s.auto_scale_video,
    auto_scale_image: s.auto_scale_image,
    hide_overlay: s.hide_overlay,
    hide_controls: s.hide_controls,
  };
}

type LinkRow = {
  id: string;
  media_asset_id: string;
  position: number;
  duration_override_seconds: number | null;
  fit_mode: string | null;
  is_active: boolean | null;
};

type MediaRow = {
  id: string;
  name: string;
  file_path: string;
  file_type?: string;
  public_url: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
  duration_seconds: number | null;
  status: string;
};

function detectMediaType(media: Pick<MediaRow, "mime_type" | "file_type" | "name">): "video" | "html" | "banner" | "image" {
  const fileType = String(media.file_type || "").toLowerCase();
  const mimeType = String(media.mime_type || "").toLowerCase();
  if (fileType.includes("video") || mimeType.startsWith("video/")) return "video";
  if (fileType.includes("html") || mimeType.startsWith("text/html")) return "html";
  if (fileType.includes("banner")) return "banner";
  return "image";
}

async function buildItemsFromPlaylist(
  client: SupabaseClient,
  orgId: string,
  playlistId: string,
  display: ScreenDisplayPayload,
): Promise<ScreenPlaylistItemPayload[]> {
  const { data: links, error: liErr } = await client
    .from("playlist_items")
    .select("id, media_asset_id, position, duration_override_seconds, fit_mode, is_active")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: true });
  if (liErr) {
    console.warn("[buildItemsFromPlaylist] playlist_items:", liErr.message);
    return [];
  }
  const linkRows = (links ?? []) as LinkRow[];
  const activeLinks = linkRows.filter((l) => l.is_active !== false);
  if (activeLinks.length === 0) return [];

  const ids = activeLinks.map((l) => l.media_asset_id);
  const { data: medias, error: mErr } = await client
    .from("media_assets")
    .select("id, name, file_type, file_path, public_url, thumbnail_url, mime_type, duration_seconds, status")
    .in("id", ids)
    .eq("organization_id", orgId);
  if (mErr) throw new Error(mErr.message);
  const byId = new Map((medias ?? []).map((m) => [String((m as MediaRow).id), m as MediaRow]));

  const entries = await Promise.all(
    activeLinks.map(async (l) => {
      const m = byId.get(l.media_asset_id);
      if (!m || (m.status !== "active" && m.status !== "draft")) return null;
      const mediaUrl = await resolvePlayableMediaUrl(client, m.file_path, m.public_url);
      if (!mediaUrl) return null;
      const itemFit = l.fit_mode && String(l.fit_mode).trim() ? String(l.fit_mode).trim() : null;
      const effective = itemFit ?? display.default_fit_mode ?? "cover";
      return {
        id: String(l.id),
        playlist_item_id: String(l.id),
        media_asset_id: m.id,
        name: m.name ?? "",
        public_url: mediaUrl,
        thumbnail_url: m.thumbnail_url,
        mime_type: m.mime_type,
        media_type: detectMediaType(m),
        duration_seconds: l.duration_override_seconds ?? m.duration_seconds,
        position: Number(l.position ?? 0),
        fit_mode: itemFit,
        fit_mode_effective: effective,
        is_active: true,
      } satisfies ScreenPlaylistItemPayload;
    }),
  );
  const items = entries.filter((e) => e != null) as ScreenPlaylistItemPayload[];
  items.sort((a, b) => a.position - b.position);
  return items;
}

async function buildOrgMediaFallback(
  client: SupabaseClient,
  orgId: string,
  display: ScreenDisplayPayload,
): Promise<ScreenPlaylistItemPayload[]> {
  const { data: fallback, error: fErr } = await client
    .from("media_assets")
    .select("id, name, file_type, file_path, public_url, thumbnail_url, mime_type, duration_seconds, status")
    .eq("organization_id", orgId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(80);
  if (fErr) throw new Error(fErr.message);
  const fallbackEntries = await Promise.all(
    (fallback ?? []).map(async (raw, idx) => {
      const m = raw as MediaRow;
      const mediaUrl = await resolvePlayableMediaUrl(client, m.file_path, m.public_url);
      if (!mediaUrl) return null;
      const eff = display.default_fit_mode ?? "cover";
      return {
        id: m.id,
        playlist_item_id: null,
        media_asset_id: m.id,
        name: m.name ?? "",
        public_url: mediaUrl,
        thumbnail_url: m.thumbnail_url,
        mime_type: m.mime_type,
        media_type: detectMediaType(m),
        duration_seconds: m.duration_seconds,
        position: idx,
        fit_mode: null,
        fit_mode_effective: eff,
        is_active: true,
      } satisfies ScreenPlaylistItemPayload;
    }),
  );
  return fallbackEntries.filter((e) => e != null) as ScreenPlaylistItemPayload[];
}

async function pickDirectAssignment(
  client: SupabaseClient,
  screenId: string,
  orgId: string,
  at: Date,
): Promise<{ playlist_id: string; priority: number } | null> {
  const { data, error } = await client
    .from("screen_playlist_assignments")
    .select("playlist_id, priority, start_at, end_at, is_active")
    .eq("screen_id", screenId)
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("priority", { ascending: false });
  if (error) {
    console.warn("[pickDirectAssignment]", error.message);
    return null;
  }
  let best: { playlist_id: string; priority: number; score: number } | null = null;
  for (const row of data ?? []) {
    const r = row as { playlist_id: string; priority: number; start_at: string | null; end_at: string | null };
    if (!assignmentWindowActive(r, at)) continue;
    const pr = typeof r.priority === "number" ? r.priority : 50;
    const sc = effectiveScore("screen_playlist_assignment", pr);
    if (!best || sc > best.score) best = { playlist_id: String(r.playlist_id), priority: pr, score: sc };
  }
  return best ? { playlist_id: best.playlist_id, priority: best.priority } : null;
}

async function pickGroupAssignment(
  client: SupabaseClient,
  screenId: string,
  orgId: string,
  at: Date,
): Promise<{ playlist_id: string; priority: number } | null> {
  const { data: memberships, error: mErr } = await client.from("screen_group_items").select("group_id").eq("screen_id", screenId);
  if (mErr) {
    console.warn("[pickGroupAssignment] memberships", mErr.message);
    return null;
  }
  const groupIds = [...new Set((memberships ?? []).map((x) => String((x as { group_id: string }).group_id)))];
  if (groupIds.length === 0) return null;

  const { data: assigns, error: aErr } = await client
    .from("screen_group_playlist_assignments")
    .select("playlist_id, priority, start_at, end_at, is_active, screen_group_id")
    .eq("organization_id", orgId)
    .in("screen_group_id", groupIds)
    .eq("is_active", true)
    .order("priority", { ascending: false });
  if (aErr) {
    console.warn("[pickGroupAssignment]", aErr.message);
    return null;
  }
  let best: { playlist_id: string; priority: number; score: number } | null = null;
  for (const row of assigns ?? []) {
    const r = row as {
      playlist_id: string;
      priority: number;
      start_at: string | null;
      end_at: string | null;
    };
    if (!assignmentWindowActive(r, at)) continue;
    const pr = typeof r.priority === "number" ? r.priority : 50;
    const sc = effectiveScore("screen_group_playlist_assignment", pr);
    if (!best || sc > best.score) best = { playlist_id: String(r.playlist_id), priority: pr, score: sc };
  }
  return best ? { playlist_id: best.playlist_id, priority: best.priority } : null;
}

async function pickCampaignPlaylist(
  client: SupabaseClient,
  screenId: string,
  orgId: string,
  unitId: string | null,
): Promise<{ campaign: CampaignRow; priority: number } | null> {
  const orFilters = [`and(target_type.eq.screen,target_id.eq.${screenId})`];
  if (unitId) orFilters.push(`and(target_type.eq.unit,target_id.eq.${unitId})`);

  const { data: targets, error: tErr } = await client
    .from("campaign_targets")
    .select("campaign_id")
    .or(orFilters.join(","));
  if (tErr) console.warn("[pickCampaignPlaylist] targets", tErr.message);
  const campaignIds = [...new Set((targets ?? []).map((t) => String((t as { campaign_id: string }).campaign_id)))];
  if (campaignIds.length === 0) return null;

  const { data: cRows, error: cErr } = await client
    .from("campaigns")
    .select("id, organization_id, name, playlist_id, priority, start_at, end_at, status")
    .eq("organization_id", orgId)
    .in("id", campaignIds);
  if (cErr) throw new Error(cErr.message);
  const campaigns = (cRows ?? []) as CampaignRow[];
  const active = campaigns.filter(campaignActiveNow).sort((a, b) => b.priority - a.priority);
  const campaign = active[0] ?? null;
  return campaign ? { campaign, priority: campaign.priority } : null;
}

export async function resolveScreenPlaylistPayload(
  client: SupabaseClient,
  screenId: string,
): Promise<ResolvedScreenPlaylist> {
  const screen = await loadScreenRow(client, screenId);
  if (!screen) {
    const emptyDisplay: ScreenDisplayPayload = {
      orientation: "horizontal",
      resolution: "1920x1080",
      screen_width: null,
      screen_height: null,
      aspect_ratio: null,
      default_fit_mode: "cover",
      auto_scale_video: true,
      auto_scale_image: true,
      hide_overlay: true,
      hide_controls: true,
    };
    return {
      organization_id: "",
      screen: { id: "", name: "", platform: null, store_type: null },
      items: [],
      source: "empty",
      campaign: null,
      playlist: null,
      display: emptyDisplay,
      etagSeed: "no-screen",
    };
  }

  const display = displayFromScreen(screen);
  const orgId = screen.organization_id;
  const at = new Date();

  type Choice = {
    playlistId: string;
    source: PlaylistResolutionSource;
    campaign: { id: string; name: string; playlist_id: string; priority: number } | null;
    score: number;
  };

  const choices: Choice[] = [];

  const direct = await pickDirectAssignment(client, screenId, orgId, at);
  if (direct) {
    choices.push({
      playlistId: direct.playlist_id,
      source: "screen_playlist_assignment",
      campaign: null,
      score: effectiveScore("screen_playlist_assignment", direct.priority),
    });
  }

  const group = await pickGroupAssignment(client, screenId, orgId, at);
  if (group) {
    choices.push({
      playlistId: group.playlist_id,
      source: "screen_group_playlist_assignment",
      campaign: null,
      score: effectiveScore("screen_group_playlist_assignment", group.priority),
    });
  }

  const campPick = await pickCampaignPlaylist(client, screenId, orgId, screen.unit_id);
  if (campPick) {
    const isEmergency = campPick.priority >= 1000;
    const source = isEmergency ? "campaign_emergency" : "campaign_playlist";
    choices.push({
      playlistId: campPick.campaign.playlist_id,
      source,
      campaign: {
        id: campPick.campaign.id,
        name: campPick.campaign.name,
        playlist_id: campPick.campaign.playlist_id,
        priority: campPick.campaign.priority,
      },
      score: effectiveScore(source, campPick.priority),
    });
  }

  choices.sort((a, b) => b.score - a.score);
  const winner = choices[0] ?? null;

  let items: ScreenPlaylistItemPayload[] = [];
  let source: PlaylistResolutionSource = "empty";
  let campaign = winner?.campaign ?? null;
  let playlistMeta: { id: string; name: string; version: number } | null = null;
  let etagSeed = `${screen.updated_at ?? screen.id}`;

  if (winner) {
    const { data: pRow } = await client
      .from("playlists")
      .select("id, name, version")
      .eq("id", winner.playlistId)
      .eq("organization_id", orgId)
      .maybeSingle();
    if (pRow) {
      playlistMeta = {
        id: String((pRow as { id: string }).id),
        name: String((pRow as { name: string }).name ?? ""),
        version: Number((pRow as { version?: number }).version ?? 1),
      };
      items = await buildItemsFromPlaylist(client, orgId, winner.playlistId, display);
      etagSeed = `${winner.source}:${winner.playlistId}:${playlistMeta.version}:${items.map((i) => i.id).join(",")}`;
      source = items.length > 0 ? winner.source : "empty";
    }
  }

  if (items.length === 0) {
    items = await buildOrgMediaFallback(client, orgId, display);
    source = items.length > 0 ? "org_media_fallback" : "empty";
    playlistMeta = null;
    campaign = null;
    etagSeed = `fallback:${orgId}:${items.map((i) => i.id).join(",")}`;
  }

  if ((source === "campaign_playlist" || source === "campaign_emergency") && campaign) {
    await client.from("screens").update({ current_campaign_id: campaign.id }).eq("id", screenId);
  } else if (source === "screen_playlist_assignment" || source === "screen_group_playlist_assignment") {
    await client.from("screens").update({ current_campaign_id: null }).eq("id", screenId);
  } else if (source === "org_media_fallback") {
    await client.from("screens").update({ current_campaign_id: null }).eq("id", screenId);
  }

  return {
    organization_id: orgId,
    screen: {
      id: screen.id,
      name: screen.name,
      platform: screen.platform,
      store_type: screen.store_type,
    },
    items,
    source,
    campaign: source === "org_media_fallback" ? null : campaign,
    playlist: playlistMeta,
    display,
    etagSeed,
  };
}

export function buildPlaylistEtagFromSeed(seed: string): string {
  return `v2:${seed.length}:${seed.slice(0, 400)}`;
}

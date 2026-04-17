import {
  mockAlerts,
  mockCampaigns,
  mockMedia,
  mockPlaylists,
  mockScreens,
  mockUnits,
  mockUsers,
  stats,
} from "@/lib/mock-data";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";

export async function getScreens() {
  if (!hasSupabaseEnv || !supabase) return mockScreens;

  const { data, error } = await supabase
    .from("screens")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCampaigns() {
  if (!hasSupabaseEnv || !supabase) return mockCampaigns;

  const { data, error } = await supabase
    .from("campaigns")
    .select("id,name,description,priority,start_at,end_at,status,playlist_id")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getDashboardBootstrap() {
  if (!hasSupabaseEnv || !supabase) {
    return {
      stats,
      screens: mockScreens,
      campaigns: mockCampaigns,
      media: mockMedia,
      playlists: mockPlaylists,
      alerts: mockAlerts,
      units: mockUnits,
      users: mockUsers,
    };
  }

  const [screensRes, campaignsRes, mediaRes, playlistsRes, alertsRes] = await Promise.all([
    supabase.from("screens").select("*"),
    supabase.from("campaigns").select("*"),
    supabase.from("media_assets").select("*"),
    supabase.from("playlists").select("*"),
    supabase.from("alerts").select("*"),
  ]);

  if (screensRes.error) throw screensRes.error;
  if (campaignsRes.error) throw campaignsRes.error;
  if (mediaRes.error) throw mediaRes.error;
  if (playlistsRes.error) throw playlistsRes.error;
  if (alertsRes.error) throw alertsRes.error;

  return {
    stats: {
      total: screensRes.data.length,
      online: screensRes.data.filter((s) => s.is_online).length,
      offline: screensRes.data.filter((s) => !s.is_online).length,
      warning: screensRes.data.filter((s) => s.device_status === "warning").length,
      campaigns: campaignsRes.data.filter((c) => c.status === "active").length,
      media: mediaRes.data.length,
      playlists: playlistsRes.data.length,
    },
    screens: screensRes.data,
    campaigns: campaignsRes.data,
    media: mediaRes.data,
    playlists: playlistsRes.data,
    alerts: alertsRes.data,
    units: [],
    users: [],
  };
}

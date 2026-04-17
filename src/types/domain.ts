export type AppRole = "admin_master" | "gestor" | "operador" | "visualizador";
export type RecordStatus = "active" | "inactive" | "draft" | "archived" | "suspended";
export type DeviceStatus = "online" | "offline" | "warning" | "syncing" | "maintenance";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  timezone: string;
  language: string;
  status: RecordStatus;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  auth_user_id: string;
  organization_id: string;
  name: string;
  email: string;
  role: AppRole;
  status: RecordStatus;
  unit_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Screen {
  id: string;
  organization_id: string;
  unit_id: string | null;
  name: string;
  pairing_code: string | null;
  pairing_expires_at: string | null;
  orientation: "horizontal" | "vertical";
  resolution: string | null;
  platform: string | null;
  os_name: string | null;
  player_version: string | null;
  device_fingerprint: string | null;
  last_seen_at: string | null;
  last_sync_at: string | null;
  is_online: boolean;
  device_status: DeviceStatus;
  current_campaign_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

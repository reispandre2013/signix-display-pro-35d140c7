-- Signix Digital Signage - Core schema, RLS, storage, auditing
-- Safe to run in Supabase migrations pipeline.

create extension if not exists pgcrypto;

create schema if not exists app_private;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin_master', 'gestor', 'operador', 'visualizador');
  end if;
  if not exists (select 1 from pg_type where typname = 'record_status') then
    create type public.record_status as enum ('active', 'inactive', 'draft', 'archived', 'suspended');
  end if;
  if not exists (select 1 from pg_type where typname = 'screen_orientation') then
    create type public.screen_orientation as enum ('horizontal', 'vertical');
  end if;
  if not exists (select 1 from pg_type where typname = 'device_status') then
    create type public.device_status as enum ('online', 'offline', 'warning', 'syncing', 'maintenance');
  end if;
  if not exists (select 1 from pg_type where typname = 'campaign_status') then
    create type public.campaign_status as enum ('draft', 'scheduled', 'active', 'paused', 'ended');
  end if;
  if not exists (select 1 from pg_type where typname = 'sync_status') then
    create type public.sync_status as enum ('success', 'failed', 'partial');
  end if;
  if not exists (select 1 from pg_type where typname = 'alert_severity') then
    create type public.alert_severity as enum ('low', 'medium', 'high', 'critical');
  end if;
  if not exists (select 1 from pg_type where typname = 'target_type') then
    create type public.target_type as enum ('screen', 'unit', 'group');
  end if;
end$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  cnpj text unique,
  email text,
  phone text,
  address text,
  city text,
  state text,
  timezone text not null default 'America/Sao_Paulo',
  language text not null default 'pt-BR',
  status public.record_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  address text,
  city text,
  state text,
  manager_name text,
  manager_phone text,
  status public.record_status not null default 'active',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name)
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  email text not null,
  role public.app_role not null default 'visualizador',
  status public.record_status not null default 'active',
  unit_id uuid references public.units(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, email)
);

create table if not exists public.screen_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name)
);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  status public.record_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name)
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  playlist_id uuid not null references public.playlists(id) on delete restrict,
  priority int not null default 50 check (priority between 1 and 100),
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.campaign_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (start_at < end_at)
);

create table if not exists public.screens (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  name text not null,
  pairing_code text,
  pairing_expires_at timestamptz,
  orientation public.screen_orientation not null default 'horizontal',
  resolution text default '1920x1080',
  platform text,
  os_name text,
  player_version text,
  device_fingerprint text,
  last_seen_at timestamptz,
  last_sync_at timestamptz,
  is_online boolean not null default false,
  device_status public.device_status not null default 'offline',
  current_campaign_id uuid references public.campaigns(id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name),
  unique (pairing_code)
);

create table if not exists public.screen_group_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.screen_groups(id) on delete cascade,
  screen_id uuid not null references public.screens(id) on delete cascade,
  unique (group_id, screen_id)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  file_type text not null,
  category text,
  tags text[] not null default '{}',
  file_path text not null,
  public_url text,
  thumbnail_url text,
  duration_seconds int check (duration_seconds is null or duration_seconds >= 0),
  file_size bigint check (file_size is null or file_size >= 0),
  mime_type text,
  valid_from timestamptz,
  valid_until timestamptz,
  status public.record_status not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (valid_from is null or valid_until is null or valid_from <= valid_until)
);

create table if not exists public.playlist_items (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  position int not null check (position >= 1),
  duration_override_seconds int check (duration_override_seconds is null or duration_override_seconds > 0),
  transition_type text default 'fade',
  created_at timestamptz not null default timezone('utc', now()),
  unique (playlist_id, position)
);

create table if not exists public.campaign_schedules (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  day_of_week int check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone text not null default 'America/Sao_Paulo',
  recurrence_rule text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (start_time < end_time)
);

create table if not exists public.campaign_targets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  target_type public.target_type not null,
  target_id uuid not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.device_heartbeats (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  screen_id uuid not null references public.screens(id) on delete cascade,
  sent_at timestamptz not null default timezone('utc', now()),
  app_version text,
  ip_address inet,
  network_status text,
  device_info jsonb not null default '{}'::jsonb,
  is_ok boolean not null default true,
  error_message text
);

create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  screen_id uuid not null references public.screens(id) on delete cascade,
  synced_at timestamptz not null default timezone('utc', now()),
  payload_version text not null,
  sync_status public.sync_status not null,
  error_message text
);

create table if not exists public.playback_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  screen_id uuid not null references public.screens(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  playlist_id uuid references public.playlists(id) on delete set null,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  played_at timestamptz not null default timezone('utc', now()),
  duration_played int check (duration_played is null or duration_played >= 0),
  playback_status text not null default 'ok',
  proof_hash text not null,
  local_event_id text,
  unique (screen_id, local_event_id)
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  screen_id uuid references public.screens(id) on delete cascade,
  alert_type text not null,
  severity public.alert_severity not null default 'medium',
  message text not null,
  resolved_at timestamptz,
  status public.record_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  key text not null,
  value jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, key)
);

create index if not exists idx_profiles_org on public.profiles (organization_id);
create index if not exists idx_units_org on public.units (organization_id);
create index if not exists idx_screens_org on public.screens (organization_id);
create index if not exists idx_screens_org_online on public.screens (organization_id, is_online, last_seen_at desc);
create index if not exists idx_screens_pairing on public.screens (pairing_code, pairing_expires_at);
create index if not exists idx_media_org on public.media_assets (organization_id, status);
create index if not exists idx_playlists_org on public.playlists (organization_id, status);
create index if not exists idx_campaigns_org_period on public.campaigns (organization_id, status, start_at, end_at, priority desc);
create index if not exists idx_campaign_targets_campaign on public.campaign_targets (campaign_id, target_type, target_id);
create index if not exists idx_heartbeats_screen_sent on public.device_heartbeats (screen_id, sent_at desc);
create index if not exists idx_sync_logs_screen_synced on public.sync_logs (screen_id, synced_at desc);
create index if not exists idx_playback_logs_screen_played on public.playback_logs (screen_id, played_at desc);
create index if not exists idx_alerts_org_created on public.alerts (organization_id, status, created_at desc);
create index if not exists idx_audit_org_created on public.audit_logs (organization_id, created_at desc);

create trigger trg_organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger trg_units_updated_at before update on public.units for each row execute function public.set_updated_at();
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_screen_groups_updated_at before update on public.screen_groups for each row execute function public.set_updated_at();
create trigger trg_screens_updated_at before update on public.screens for each row execute function public.set_updated_at();
create trigger trg_media_assets_updated_at before update on public.media_assets for each row execute function public.set_updated_at();
create trigger trg_playlists_updated_at before update on public.playlists for each row execute function public.set_updated_at();
create trigger trg_campaigns_updated_at before update on public.campaigns for each row execute function public.set_updated_at();
create trigger trg_campaign_schedules_updated_at before update on public.campaign_schedules for each row execute function public.set_updated_at();
create trigger trg_app_settings_updated_at before update on public.app_settings for each row execute function public.set_updated_at();

create or replace function public.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select p.*
  from public.profiles p
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.current_profile();
$$;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.current_profile();
$$;

create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.current_profile();
$$;

create or replace function public.role_weight(role_name public.app_role)
returns int
language sql
immutable
as $$
  select case role_name
    when 'admin_master' then 100
    when 'gestor' then 70
    when 'operador' then 40
    else 10
  end;
$$;

create or replace function public.has_role(min_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.role_weight(public.current_role()) >= public.role_weight(min_role);
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.organization_id = org_id
      and p.status = 'active'
  );
$$;

create or replace function app_private.write_audit_log(
  p_organization_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_old_data jsonb,
  p_new_data jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (
    organization_id,
    actor_profile_id,
    entity_type,
    entity_id,
    action,
    old_data,
    new_data
  )
  values (
    p_organization_id,
    public.current_profile_id(),
    p_entity_type,
    p_entity_id,
    p_action,
    p_old_data,
    p_new_data
  );
end;
$$;

create or replace function app_private.audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
begin
  v_org := case
    when tg_op = 'DELETE' then old.organization_id
    else new.organization_id
  end;

  perform app_private.write_audit_log(
    v_org,
    tg_table_name,
    case when tg_op = 'DELETE' then old.id else new.id end,
    lower(tg_op),
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_media_assets on public.media_assets;
create trigger trg_audit_media_assets after insert or update or delete on public.media_assets for each row execute function app_private.audit_trigger();

drop trigger if exists trg_audit_playlists on public.playlists;
create trigger trg_audit_playlists after insert or update or delete on public.playlists for each row execute function app_private.audit_trigger();

drop trigger if exists trg_audit_campaigns on public.campaigns;
create trigger trg_audit_campaigns after insert or update or delete on public.campaigns for each row execute function app_private.audit_trigger();

drop trigger if exists trg_audit_screens on public.screens;
create trigger trg_audit_screens after insert or update or delete on public.screens for each row execute function app_private.audit_trigger();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.units enable row level security;
alter table public.screen_groups enable row level security;
alter table public.screens enable row level security;
alter table public.screen_group_items enable row level security;
alter table public.media_assets enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_items enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_schedules enable row level security;
alter table public.campaign_targets enable row level security;
alter table public.device_heartbeats enable row level security;
alter table public.sync_logs enable row level security;
alter table public.playback_logs enable row level security;
alter table public.alerts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.app_settings enable row level security;

create policy "organizations_select_member"
on public.organizations for select
using (public.is_org_member(id));

create policy "profiles_select_same_org"
on public.profiles for select
using (public.is_org_member(organization_id));

create policy "profiles_insert_admin_master"
on public.profiles for insert
with check (public.has_role('admin_master') and public.is_org_member(organization_id));

create policy "profiles_update_admin_or_self"
on public.profiles for update
using (public.is_org_member(organization_id))
with check (
  public.is_org_member(organization_id)
  and (public.has_role('admin_master') or auth_user_id = auth.uid())
);

create policy "profiles_delete_admin_master"
on public.profiles for delete
using (public.has_role('admin_master') and public.is_org_member(organization_id));

create policy "units_select_same_org"
on public.units for select
using (public.is_org_member(organization_id));

create policy "units_write_gestor_plus"
on public.units for all
using (public.is_org_member(organization_id) and public.has_role('gestor'))
with check (public.is_org_member(organization_id) and public.has_role('gestor'));

create policy "screen_groups_select_same_org"
on public.screen_groups for select
using (public.is_org_member(organization_id));

create policy "screen_groups_write_operador_plus"
on public.screen_groups for all
using (public.is_org_member(organization_id) and public.has_role('operador'))
with check (public.is_org_member(organization_id) and public.has_role('operador'));

create policy "screens_select_same_org"
on public.screens for select
using (public.is_org_member(organization_id));

create policy "screens_write_operador_plus"
on public.screens for all
using (public.is_org_member(organization_id) and public.has_role('operador'))
with check (public.is_org_member(organization_id) and public.has_role('operador'));

create policy "screen_group_items_select_same_org"
on public.screen_group_items for select
using (
  exists (
    select 1 from public.screen_groups g
    where g.id = screen_group_items.group_id
      and public.is_org_member(g.organization_id)
  )
);

create policy "screen_group_items_write_operador_plus"
on public.screen_group_items for all
using (
  exists (
    select 1 from public.screen_groups g
    where g.id = screen_group_items.group_id
      and public.is_org_member(g.organization_id)
      and public.has_role('operador')
  )
)
with check (
  exists (
    select 1 from public.screen_groups g
    where g.id = screen_group_items.group_id
      and public.is_org_member(g.organization_id)
      and public.has_role('operador')
  )
);

create policy "media_assets_select_same_org"
on public.media_assets for select
using (public.is_org_member(organization_id));

create policy "media_assets_write_operador_plus"
on public.media_assets for all
using (public.is_org_member(organization_id) and public.has_role('operador'))
with check (public.is_org_member(organization_id) and public.has_role('operador'));

create policy "playlists_select_same_org"
on public.playlists for select
using (public.is_org_member(organization_id));

create policy "playlists_write_operador_plus"
on public.playlists for all
using (public.is_org_member(organization_id) and public.has_role('operador'))
with check (public.is_org_member(organization_id) and public.has_role('operador'));

create policy "playlist_items_select_same_org"
on public.playlist_items for select
using (
  exists (
    select 1 from public.playlists p
    where p.id = playlist_items.playlist_id
      and public.is_org_member(p.organization_id)
  )
);

create policy "playlist_items_write_operador_plus"
on public.playlist_items for all
using (
  exists (
    select 1 from public.playlists p
    where p.id = playlist_items.playlist_id
      and public.is_org_member(p.organization_id)
      and public.has_role('operador')
  )
)
with check (
  exists (
    select 1 from public.playlists p
    where p.id = playlist_items.playlist_id
      and public.is_org_member(p.organization_id)
      and public.has_role('operador')
  )
);

create policy "campaigns_select_same_org"
on public.campaigns for select
using (public.is_org_member(organization_id));

create policy "campaigns_write_operador_plus"
on public.campaigns for all
using (public.is_org_member(organization_id) and public.has_role('operador'))
with check (public.is_org_member(organization_id) and public.has_role('operador'));

create policy "campaign_schedules_select_same_org"
on public.campaign_schedules for select
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_schedules.campaign_id
      and public.is_org_member(c.organization_id)
  )
);

create policy "campaign_schedules_write_operador_plus"
on public.campaign_schedules for all
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_schedules.campaign_id
      and public.is_org_member(c.organization_id)
      and public.has_role('operador')
  )
)
with check (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_schedules.campaign_id
      and public.is_org_member(c.organization_id)
      and public.has_role('operador')
  )
);

create policy "campaign_targets_select_same_org"
on public.campaign_targets for select
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_targets.campaign_id
      and public.is_org_member(c.organization_id)
  )
);

create policy "campaign_targets_write_operador_plus"
on public.campaign_targets for all
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_targets.campaign_id
      and public.is_org_member(c.organization_id)
      and public.has_role('operador')
  )
)
with check (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_targets.campaign_id
      and public.is_org_member(c.organization_id)
      and public.has_role('operador')
  )
);

create policy "device_heartbeats_select_same_org"
on public.device_heartbeats for select
using (public.is_org_member(organization_id));

create policy "device_heartbeats_insert_operador_plus"
on public.device_heartbeats for insert
with check (public.is_org_member(organization_id) and public.has_role('operador'));

create policy "sync_logs_select_same_org"
on public.sync_logs for select
using (public.is_org_member(organization_id));

create policy "sync_logs_insert_operador_plus"
on public.sync_logs for insert
with check (public.is_org_member(organization_id) and public.has_role('operador'));

create policy "playback_logs_select_same_org"
on public.playback_logs for select
using (public.is_org_member(organization_id));

create policy "playback_logs_insert_operador_plus"
on public.playback_logs for insert
with check (public.is_org_member(organization_id) and public.has_role('operador'));

create policy "alerts_select_same_org"
on public.alerts for select
using (public.is_org_member(organization_id));

create policy "alerts_write_operador_plus"
on public.alerts for all
using (public.is_org_member(organization_id) and public.has_role('operador'))
with check (public.is_org_member(organization_id) and public.has_role('operador'));

create policy "audit_logs_select_same_org"
on public.audit_logs for select
using (public.is_org_member(organization_id) and public.has_role('gestor'));

create policy "app_settings_select_same_org"
on public.app_settings for select
using (public.is_org_member(organization_id));

create policy "app_settings_write_gestor_plus"
on public.app_settings for all
using (public.is_org_member(organization_id) and public.has_role('gestor'))
with check (public.is_org_member(organization_id) and public.has_role('gestor'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('logos', 'logos', true, 10485760, array['image/png','image/jpeg','image/webp']),
  ('media-images', 'media-images', false, 52428800, array['image/png','image/jpeg','image/webp']),
  ('media-videos', 'media-videos', false, 524288000, array['video/mp4','video/webm','video/quicktime']),
  ('thumbnails', 'thumbnails', false, 10485760, array['image/png','image/jpeg','image/webp']),
  ('temp-imports', 'temp-imports', false, 104857600, array['text/csv','application/json','application/zip'])
on conflict (id) do nothing;

create policy "storage_org_read"
on storage.objects for select
using (
  bucket_id in ('logos','media-images','media-videos','thumbnails','temp-imports')
  and (
    bucket_id = 'logos'
    or public.is_org_member((coalesce((metadata->>'organization_id')::uuid, public.current_organization_id())))
  )
);

create policy "storage_org_write_operador_plus"
on storage.objects for insert
with check (
  bucket_id in ('logos','media-images','media-videos','thumbnails','temp-imports')
  and public.has_role('operador')
  and public.is_org_member((coalesce((metadata->>'organization_id')::uuid, public.current_organization_id())))
);

create policy "storage_org_update_operador_plus"
on storage.objects for update
using (
  bucket_id in ('logos','media-images','media-videos','thumbnails','temp-imports')
  and public.has_role('operador')
  and public.is_org_member((coalesce((metadata->>'organization_id')::uuid, public.current_organization_id())))
)
with check (
  bucket_id in ('logos','media-images','media-videos','thumbnails','temp-imports')
  and public.has_role('operador')
  and public.is_org_member((coalesce((metadata->>'organization_id')::uuid, public.current_organization_id())))
);

create policy "storage_org_delete_gestor_plus"
on storage.objects for delete
using (
  bucket_id in ('logos','media-images','media-videos','thumbnails','temp-imports')
  and public.has_role('gestor')
  and public.is_org_member((coalesce((metadata->>'organization_id')::uuid, public.current_organization_id())))
);

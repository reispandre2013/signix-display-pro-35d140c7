-- ============================================================================
-- Web Player module (dedicated stack, idempotent)
-- ============================================================================

alter table public.screens add column if not exists player_type text;
alter table public.screens add column if not exists device_token_hash text;
alter table public.screens add column if not exists browser_name text;
alter table public.screens add column if not exists browser_version text;
alter table public.screens add column if not exists user_agent text;
alter table public.screens add column if not exists heartbeat_interval integer not null default 60;
alter table public.screens add column if not exists sync_interval integer not null default 90;
alter table public.screens add column if not exists autoplay_video boolean not null default true;
alter table public.screens add column if not exists loop_enabled boolean not null default true;
alter table public.screens add column if not exists allow_debug boolean not null default false;
alter table public.screens add column if not exists current_playlist_id uuid references public.playlists(id) on delete set null;
alter table public.screens add column if not exists display_token text;
alter table public.screens add column if not exists display_token_expires_at timestamptz;

create index if not exists idx_screens_display_token on public.screens(display_token);
create index if not exists idx_screens_device_token_hash on public.screens(device_token_hash);

create table if not exists public.web_player_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  screen_id uuid not null references public.screens(id) on delete cascade,
  device_token_hash text not null,
  fingerprint text,
  user_agent text,
  browser_name text,
  browser_version text,
  ip_address text,
  paired_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz,
  revoked_at timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_web_player_sessions_screen on public.web_player_sessions(screen_id);
create index if not exists idx_web_player_sessions_org on public.web_player_sessions(organization_id);
create index if not exists idx_web_player_sessions_status on public.web_player_sessions(status);
create index if not exists idx_web_player_sessions_token_hash on public.web_player_sessions(device_token_hash);

alter table public.web_player_sessions enable row level security;

drop policy if exists "web_sessions_select_org" on public.web_player_sessions;
create policy "web_sessions_select_org" on public.web_player_sessions for select to authenticated
  using (
    organization_id = (select p.organization_id from public.profiles p where p.auth_user_id = auth.uid())
    or public.is_platform_admin()
  );

drop policy if exists "web_sessions_mutation_super" on public.web_player_sessions;
create policy "web_sessions_mutation_super" on public.web_player_sessions for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

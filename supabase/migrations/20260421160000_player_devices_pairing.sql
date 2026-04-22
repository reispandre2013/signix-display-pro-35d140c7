-- Dispositivo persistente do player (TV): auth por token, reset de pareamento e auditoria.

create table if not exists public.player_devices (
  id uuid primary key default gen_random_uuid(),
  screen_id uuid not null references public.screens (id) on delete cascade,
  device_name text not null default 'display',
  auth_secret_hash text,
  auth_issued_at timestamptz,
  pairing_status text not null default 'active'
    check (pairing_status in ('active', 'pending_pairing')),
  playlist_id uuid references public.playlists (id) on delete set null,
  last_seen_at timestamptz,
  pairing_reset_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (screen_id)
);

create index if not exists idx_player_devices_screen on public.player_devices (screen_id);
create index if not exists idx_player_devices_pairing_status on public.player_devices (pairing_status);

create trigger trg_player_devices_updated_at
before update on public.player_devices
for each row execute function public.set_updated_at();

alter table public.player_devices enable row level security;

comment on table public.player_devices is
  'Credenciais do player por tela: device_id estável, auth_token (hash), estado de pareamento.';

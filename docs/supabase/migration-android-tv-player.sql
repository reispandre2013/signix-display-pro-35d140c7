-- =============================================================================
-- ANDROID TV PLAYER — execute no SQL Editor do Supabase ANTES de usar o APK.
-- Não altera nenhuma tabela existente. Cria apenas android_tv_devices.
-- =============================================================================

create table if not exists public.android_tv_devices (
  id uuid primary key default gen_random_uuid(),
  device_uuid text not null unique,
  device_token text not null unique,
  pairing_code text not null unique,
  status text not null default 'pending'
    check (status in ('pending','paired','revoked')),
  screen_id uuid references public.screens(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete cascade,
  device_name text,
  manufacturer text,
  model text,
  app_version text,
  android_version text,
  last_seen_at timestamptz,
  last_ip text,
  last_error text,
  paired_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_android_tv_devices_status on public.android_tv_devices (status);
create index if not exists idx_android_tv_devices_screen on public.android_tv_devices (screen_id);
create index if not exists idx_android_tv_devices_org on public.android_tv_devices (organization_id);

create trigger trg_android_tv_devices_updated_at
before update on public.android_tv_devices
for each row execute function public.set_updated_at();

alter table public.android_tv_devices enable row level security;

do $$ begin
  create policy "android_tv_devices_select_org"
    on public.android_tv_devices for select
    to authenticated
    using (
      organization_id is null
      or exists (
        select 1 from public.profiles p
        where p.auth_user_id = auth.uid()
          and (p.organization_id = android_tv_devices.organization_id or p.role = 'super_admin')
      )
    );
exception when duplicate_object then null; end $$;

comment on table public.android_tv_devices is
  'Dispositivos Android TV nativos (APK Kotlin) com pareamento permanente por device_uuid + token.';

-- ============================================================================
-- Android TV Auto-Pairing — execute no SQL Editor do Supabase.
-- Compatível com pareamento atual (Web/Tizen continuam funcionando).
-- ============================================================================

alter table public.player_devices
  alter column screen_id drop not null;

alter table public.player_devices
  add column if not exists device_uuid text,
  add column if not exists platform text,
  add column if not exists tv_model text,
  add column if not exists manufacturer text,
  add column if not exists app_version text,
  add column if not exists auto_register_status text
    check (auto_register_status in ('pending','active','blocked')),
  add column if not exists last_seen timestamptz,
  add column if not exists organization_id uuid references public.organizations(id) on delete set null;

create unique index if not exists idx_player_devices_device_uuid
  on public.player_devices (device_uuid)
  where device_uuid is not null;

create index if not exists idx_player_devices_auto_register
  on public.player_devices (auto_register_status, platform);

do $$ begin
  create policy "player_devices_select_org_or_pending"
    on public.player_devices for select
    to authenticated
    using (
      organization_id is null
      or exists (
        select 1 from public.user_roles ur
        where ur.user_id = auth.uid()
          and (ur.organization_id = player_devices.organization_id or ur.role = 'super_admin')
      )
      or exists (
        select 1 from public.profiles p
        where p.auth_user_id = auth.uid()
          and (p.organization_id = player_devices.organization_id or p.role = 'super_admin')
      )
    );
exception when duplicate_object then null; end $$;

comment on column public.player_devices.device_uuid is
  'UUID gerado pelo APK Android TV na primeira execução; persistente no dispositivo.';
comment on column public.player_devices.auto_register_status is
  'Estado do auto-registro Android: pending → admin nomeia/ativa → active.';

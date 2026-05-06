-- =====================================================================
-- Módulo Rádio Online — aplicar manualmente no Supabase
-- Caminho sugerido: supabase/migrations/20260506232400_radio_streams.sql
-- =====================================================================

create table if not exists public.radio_streams (
  id uuid primary key default gen_random_uuid(),
  screen_id uuid not null unique references public.screens(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  radio_name text not null default 'Rádio',
  stream_url text not null,
  volume numeric(3,2) not null default 0.80 check (volume >= 0 and volume <= 1),
  is_active boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists radio_streams_org_idx on public.radio_streams(organization_id);

alter table public.radio_streams enable row level security;

drop policy if exists "radio_streams_super_admin_all" on public.radio_streams;
create policy "radio_streams_super_admin_all"
  on public.radio_streams for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'super_admin'))
  with check (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'super_admin'));

drop policy if exists "radio_streams_org_read" on public.radio_streams;
create policy "radio_streams_org_read"
  on public.radio_streams for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.organization_id = radio_streams.organization_id));

create or replace function public.touch_radio_streams_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := timezone('utc', now()); return new; end$$;

drop trigger if exists trg_touch_radio_streams on public.radio_streams;
create trigger trg_touch_radio_streams
  before update on public.radio_streams
  for each row execute function public.touch_radio_streams_updated_at();

-- Realtime (ignore se já estiver na publicação)
do $$
begin
  begin
    alter publication supabase_realtime add table public.radio_streams;
  exception when duplicate_object then null;
  end;
end$$;

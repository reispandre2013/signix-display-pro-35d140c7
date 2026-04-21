-- Playlists, itens, telas e atribuições directas/grupo para o player.
-- Idempotente: seguro reaplicar em ambientes com schema parcialmente divergente.

-- ---------------------------------------------------------------------------
-- playlists.version
-- ---------------------------------------------------------------------------
alter table public.playlists
  add column if not exists version integer not null default 1;

-- ---------------------------------------------------------------------------
-- playlist_items: exibição por item + auditoria + updated_at
-- ---------------------------------------------------------------------------
alter table public.playlist_items
  add column if not exists fit_mode text not null default 'cover';

alter table public.playlist_items
  add column if not exists is_active boolean not null default true;

alter table public.playlist_items
  add column if not exists notes text;

alter table public.playlist_items
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'playlist_items_fit_mode_check'
  ) then
    alter table public.playlist_items
      add constraint playlist_items_fit_mode_check
      check (fit_mode in ('contain', 'cover', 'stretch', 'center', 'fit-width', 'fit-height'));
  end if;
end $$;

drop trigger if exists trg_playlist_items_updated_at on public.playlist_items;
create trigger trg_playlist_items_updated_at
before update on public.playlist_items
for each row execute function public.set_updated_at();

-- Versão da playlist quando itens mudam (cache do player / ETag).
-- Durante reindex_playlist_items usamos set_config('signix.skip_playlist_bump','on', true) para evitar N bumps.
create or replace function public.bump_playlist_version_from_items()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(nullif(current_setting('signix.skip_playlist_bump', true), ''), '') = 'on' then
    return coalesce(new, old);
  end if;
  update public.playlists
  set version = version + 1,
      updated_at = timezone('utc', now())
  where id = coalesce(new.playlist_id, old.playlist_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_playlist_items_bump_version on public.playlist_items;
create trigger trg_playlist_items_bump_version
after insert or update or delete on public.playlist_items
for each row execute function public.bump_playlist_version_from_items();

-- Auditoria em playlist_items (sem organization_id na linha).
create or replace function app_private.audit_playlist_items_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
begin
  select p.organization_id into v_org
  from public.playlists p
  where p.id = coalesce(new.playlist_id, old.playlist_id);

  perform app_private.write_audit_log(
    v_org,
    'playlist_items',
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

drop trigger if exists trg_audit_playlist_items on public.playlist_items;
create trigger trg_audit_playlist_items
after insert or update or delete on public.playlist_items
for each row execute function app_private.audit_playlist_items_row();

-- ---------------------------------------------------------------------------
-- screens: dimensões, fit por defeito, escala automática, UI limpa
-- ---------------------------------------------------------------------------
alter table public.screens
  add column if not exists screen_width integer;

alter table public.screens
  add column if not exists screen_height integer;

alter table public.screens
  add column if not exists aspect_ratio text;

alter table public.screens
  add column if not exists default_fit_mode text not null default 'cover';

alter table public.screens
  add column if not exists auto_scale_video boolean not null default true;

alter table public.screens
  add column if not exists auto_scale_image boolean not null default true;

alter table public.screens
  add column if not exists hide_overlay boolean not null default true;

alter table public.screens
  add column if not exists hide_controls boolean not null default true;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'screens_default_fit_mode_check'
  ) then
    alter table public.screens
      add constraint screens_default_fit_mode_check
      check (default_fit_mode in ('contain', 'cover', 'stretch', 'center', 'fit-width', 'fit-height'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Atribuição directa playlist ↔ tela
-- ---------------------------------------------------------------------------
create table if not exists public.screen_playlist_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  screen_id uuid not null references public.screens(id) on delete cascade,
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  assignment_type text not null default 'primary',
  priority int not null default 80 check (priority between 1 and 100),
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_screen_playlist_assign_screen
  on public.screen_playlist_assignments (screen_id, is_active, priority desc);

create index if not exists idx_screen_playlist_assign_org
  on public.screen_playlist_assignments (organization_id);

drop trigger if exists trg_screen_playlist_assignments_updated_at on public.screen_playlist_assignments;
create trigger trg_screen_playlist_assignments_updated_at
before update on public.screen_playlist_assignments
for each row execute function public.set_updated_at();

alter table public.screen_playlist_assignments enable row level security;

drop policy if exists "screen_playlist_assignments_select_same_org" on public.screen_playlist_assignments;
create policy "screen_playlist_assignments_select_same_org"
on public.screen_playlist_assignments for select
using (public.is_org_member(organization_id));

drop policy if exists "screen_playlist_assignments_write_operador_plus" on public.screen_playlist_assignments;
create policy "screen_playlist_assignments_write_operador_plus"
on public.screen_playlist_assignments for all
using (public.is_org_member(organization_id) and public.has_role('operador'))
with check (public.is_org_member(organization_id) and public.has_role('operador'));

drop trigger if exists trg_audit_screen_playlist_assignments on public.screen_playlist_assignments;
create trigger trg_audit_screen_playlist_assignments
after insert or update or delete on public.screen_playlist_assignments
for each row execute function app_private.audit_trigger();

-- ---------------------------------------------------------------------------
-- Atribuição playlist ↔ grupo de telas
-- ---------------------------------------------------------------------------
create table if not exists public.screen_group_playlist_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  screen_group_id uuid not null references public.screen_groups(id) on delete cascade,
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  priority int not null default 60 check (priority between 1 and 100),
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_screen_group_playlist_assign_group
  on public.screen_group_playlist_assignments (screen_group_id, is_active, priority desc);

create index if not exists idx_screen_group_playlist_assign_org
  on public.screen_group_playlist_assignments (organization_id);

drop trigger if exists trg_screen_group_playlist_assignments_updated_at on public.screen_group_playlist_assignments;
create trigger trg_screen_group_playlist_assignments_updated_at
before update on public.screen_group_playlist_assignments
for each row execute function public.set_updated_at();

alter table public.screen_group_playlist_assignments enable row level security;

drop policy if exists "screen_group_playlist_assignments_select_same_org" on public.screen_group_playlist_assignments;
create policy "screen_group_playlist_assignments_select_same_org"
on public.screen_group_playlist_assignments for select
using (public.is_org_member(organization_id));

drop policy if exists "screen_group_playlist_assignments_write_operador_plus" on public.screen_group_playlist_assignments;
create policy "screen_group_playlist_assignments_write_operador_plus"
on public.screen_group_playlist_assignments for all
using (public.is_org_member(organization_id) and public.has_role('operador'))
with check (public.is_org_member(organization_id) and public.has_role('operador'));

drop trigger if exists trg_audit_screen_group_playlist_assignments on public.screen_group_playlist_assignments;
create trigger trg_audit_screen_group_playlist_assignments
after insert or update or delete on public.screen_group_playlist_assignments
for each row execute function app_private.audit_trigger();

-- ---------------------------------------------------------------------------
-- RPC: reindexar posições (evita violações de unique em reordenações)
-- ---------------------------------------------------------------------------
create or replace function public.reindex_playlist_items(p_playlist_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_playlist_id is null then
    return;
  end if;

  perform set_config('signix.skip_playlist_bump', 'on', true);

  with ordered as (
    select id, row_number() over (order by position asc, created_at asc) as rn
    from public.playlist_items
    where playlist_id = p_playlist_id
  )
  update public.playlist_items pi
  set position = -o.rn,
      updated_at = timezone('utc', now())
  from ordered o
  where pi.id = o.id;

  with ordered as (
    select id, row_number() over (order by position asc, created_at asc) as rn
    from public.playlist_items
    where playlist_id = p_playlist_id
  )
  update public.playlist_items pi
  set position = o.rn,
      updated_at = timezone('utc', now())
  from ordered o
  where pi.id = o.id;

  perform set_config('signix.skip_playlist_bump', 'off', true);

  update public.playlists
  set version = version + 1,
      updated_at = timezone('utc', now())
  where id = p_playlist_id;
end;
$$;

grant execute on function public.reindex_playlist_items(uuid) to authenticated;
grant execute on function public.reindex_playlist_items(uuid) to service_role;

-- Ordem explícita (ex.: drag-and-drop): ids na sequência desejada.
create or replace function public.reorder_playlist_items(p_playlist_id uuid, p_ordered_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  i int := 1;
  aid uuid;
  n int;
begin
  if p_playlist_id is null or p_ordered_ids is null then
    return;
  end if;

  n := coalesce(array_length(p_ordered_ids, 1), 0);
  if n = 0 then
    return;
  end if;

  perform set_config('signix.skip_playlist_bump', 'on', true);

  for i in 1..n loop
    aid := p_ordered_ids[i];
    update public.playlist_items
    set position = -i,
        updated_at = timezone('utc', now())
    where id = aid
      and playlist_id = p_playlist_id;
  end loop;

  for i in 1..n loop
    aid := p_ordered_ids[i];
    update public.playlist_items
    set position = i,
        updated_at = timezone('utc', now())
    where id = aid
      and playlist_id = p_playlist_id;
  end loop;

  perform set_config('signix.skip_playlist_bump', 'off', true);

  update public.playlists
  set version = version + 1,
      updated_at = timezone('utc', now())
  where id = p_playlist_id;
end;
$$;

grant execute on function public.reorder_playlist_items(uuid, uuid[]) to authenticated;
grant execute on function public.reorder_playlist_items(uuid, uuid[]) to service_role;

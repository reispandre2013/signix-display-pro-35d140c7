-- Signix - RPCs and automation workflows for players and operations

create or replace function public.generate_pairing_code()
returns text
language sql
as $$
  select upper(substr(md5(gen_random_uuid()::text), 1, 4))
         || '-'
         || upper(substr(md5((gen_random_uuid()::text || clock_timestamp()::text)), 1, 4));
$$;

create or replace function public.prepare_screen_pairing(
  p_screen_id uuid,
  p_expires_in_minutes int default 10
)
returns table (pairing_code text, pairing_expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_exp timestamptz;
begin
  if not public.has_role('operador') then
    raise exception 'not authorized';
  end if;

  v_code := public.generate_pairing_code();
  v_exp := timezone('utc', now()) + make_interval(mins => greatest(1, least(p_expires_in_minutes, 120)));

  update public.screens
  set pairing_code = v_code,
      pairing_expires_at = v_exp,
      updated_at = timezone('utc', now())
  where id = p_screen_id
    and organization_id = public.current_organization_id();

  if not found then
    raise exception 'screen not found or no permission';
  end if;

  return query select v_code, v_exp;
end;
$$;

create or replace function public.pair_screen_by_code(
  p_pairing_code text,
  p_device_fingerprint text,
  p_platform text,
  p_os_name text,
  p_player_version text
)
returns table (
  screen_id uuid,
  organization_id uuid,
  unit_id uuid,
  screen_name text,
  paired boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_screen public.screens;
begin
  select s.*
  into v_screen
  from public.screens s
  where s.pairing_code = p_pairing_code
    and s.pairing_expires_at is not null
    and s.pairing_expires_at >= timezone('utc', now())
  limit 1;

  if not found then
    raise exception 'invalid or expired pairing code';
  end if;

  update public.screens
  set device_fingerprint = p_device_fingerprint,
      platform = coalesce(p_platform, platform),
      os_name = coalesce(p_os_name, os_name),
      player_version = coalesce(p_player_version, player_version),
      pairing_code = null,
      pairing_expires_at = null,
      device_status = 'online',
      is_online = true,
      last_seen_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = v_screen.id;

  perform app_private.write_audit_log(
    v_screen.organization_id,
    'screens',
    v_screen.id,
    'pair',
    null,
    jsonb_build_object('device_fingerprint', p_device_fingerprint, 'player_version', p_player_version)
  );

  return query
  select v_screen.id, v_screen.organization_id, v_screen.unit_id, v_screen.name, true;
end;
$$;

create or replace function public.resolve_screen_campaign(
  p_screen_id uuid,
  p_at timestamptz default timezone('utc', now())
)
returns table (
  campaign_id uuid,
  campaign_name text,
  playlist_id uuid,
  playlist_name text,
  payload_version text
)
language sql
stable
security definer
set search_path = public
as $$
with screen_ctx as (
  select s.id, s.organization_id, s.unit_id
  from public.screens s
  where s.id = p_screen_id
),
candidate as (
  select c.id, c.name, c.playlist_id, p.name as playlist_name, c.priority, c.updated_at
  from public.campaigns c
  join public.playlists p on p.id = c.playlist_id
  join screen_ctx s on s.organization_id = c.organization_id
  where c.status in ('active', 'scheduled')
    and p.status in ('active', 'draft')
    and c.start_at <= p_at
    and c.end_at >= p_at
    and exists (
      select 1
      from public.campaign_targets ct
      where ct.campaign_id = c.id
        and (
          (ct.target_type = 'screen' and ct.target_id = s.id)
          or (ct.target_type = 'unit' and ct.target_id = s.unit_id)
          or (ct.target_type = 'group' and exists (
            select 1
            from public.screen_group_items sgi
            where sgi.group_id = ct.target_id
              and sgi.screen_id = s.id
          ))
        )
    )
    and (
      not exists (select 1 from public.campaign_schedules sch where sch.campaign_id = c.id and sch.is_active)
      or exists (
        select 1
        from public.campaign_schedules sch
        where sch.campaign_id = c.id
          and sch.is_active
          and (sch.day_of_week is null or sch.day_of_week = extract(dow from p_at))
          and sch.start_time <= (p_at at time zone sch.timezone)::time
          and sch.end_time >= (p_at at time zone sch.timezone)::time
      )
    )
)
select
  c.id,
  c.name,
  c.playlist_id,
  c.playlist_name,
  md5(c.id::text || ':' || c.updated_at::text) as payload_version
from candidate c
order by c.priority desc, c.updated_at desc
limit 1;
$$;

create or replace function public.register_screen_heartbeat(
  p_screen_id uuid,
  p_app_version text,
  p_ip_address inet,
  p_network_status text,
  p_device_info jsonb default '{}'::jsonb,
  p_is_ok boolean default true,
  p_error_message text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.screens where id = p_screen_id;
  if v_org is null then
    raise exception 'screen not found';
  end if;

  insert into public.device_heartbeats (
    organization_id, screen_id, app_version, ip_address, network_status, device_info, is_ok, error_message
  )
  values (
    v_org, p_screen_id, p_app_version, p_ip_address, p_network_status, coalesce(p_device_info, '{}'::jsonb), p_is_ok, p_error_message
  );

  update public.screens
  set is_online = true,
      device_status = case when p_is_ok then 'online' else 'warning' end,
      last_seen_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = p_screen_id;
end;
$$;

create or replace function public.register_sync_log(
  p_screen_id uuid,
  p_payload_version text,
  p_status public.sync_status,
  p_error_message text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.screens where id = p_screen_id;
  if v_org is null then
    raise exception 'screen not found';
  end if;

  insert into public.sync_logs (organization_id, screen_id, payload_version, sync_status, error_message)
  values (v_org, p_screen_id, p_payload_version, p_status, p_error_message);

  update public.screens
  set last_sync_at = timezone('utc', now()),
      device_status = case when p_status = 'success' then 'online' when p_status = 'failed' then 'warning' else device_status end,
      updated_at = timezone('utc', now())
  where id = p_screen_id;
end;
$$;

create or replace function public.register_playback_log(
  p_screen_id uuid,
  p_campaign_id uuid,
  p_playlist_id uuid,
  p_media_asset_id uuid,
  p_duration_played int,
  p_playback_status text,
  p_local_event_id text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
  v_proof_hash text;
begin
  select organization_id into v_org from public.screens where id = p_screen_id;
  if v_org is null then
    raise exception 'screen not found';
  end if;

  v_proof_hash := encode(
    digest(
      concat_ws('|', p_screen_id::text, coalesce(p_campaign_id::text, ''), coalesce(p_media_asset_id::text, ''), clock_timestamp()::text, coalesce(p_local_event_id, '')),
      'sha256'
    ),
    'hex'
  );

  insert into public.playback_logs (
    organization_id, screen_id, campaign_id, playlist_id, media_asset_id, duration_played, playback_status, proof_hash, local_event_id
  )
  values (
    v_org, p_screen_id, p_campaign_id, p_playlist_id, p_media_asset_id, p_duration_played, coalesce(p_playback_status, 'ok'), v_proof_hash, p_local_event_id
  )
  on conflict (screen_id, local_event_id) do update
  set duration_played = excluded.duration_played,
      playback_status = excluded.playback_status;

  return v_proof_hash;
end;
$$;

create or replace function public.mark_offline_screens(p_timeout_minutes int default 5)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  with changed as (
    update public.screens s
    set is_online = false,
        device_status = 'offline',
        updated_at = timezone('utc', now())
    where coalesce(s.last_seen_at, timezone('utc', now()) - interval '365 days') < timezone('utc', now()) - make_interval(mins => p_timeout_minutes)
      and s.is_online = true
    returning s.id, s.organization_id
  )
  insert into public.alerts (organization_id, screen_id, alert_type, severity, message, status)
  select c.organization_id, c.id, 'offline_timeout', 'high', 'Screen sem heartbeat recente', 'active'
  from changed c;

  get diagnostics v_count = row_count;
  return coalesce(v_count, 0);
end;
$$;

create or replace function public.cleanup_orphan_media_assets()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  delete from public.media_assets m
  where m.status = 'archived'
    and not exists (
      select 1
      from public.playlist_items pi
      where pi.media_asset_id = m.id
    )
    and m.updated_at < timezone('utc', now()) - interval '30 days';

  get diagnostics v_deleted = row_count;
  return coalesce(v_deleted, 0);
end;
$$;

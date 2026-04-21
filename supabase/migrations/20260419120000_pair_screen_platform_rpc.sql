-- Corrige pair_screen_by_code:
-- 1) Só aceita p_platform semântico ('android' | 'tizen'); ignora strings tipo navigator.platform.
-- 2) Mantém platform já persistido se for android/tizen; senão default 'android'.
-- 3) Retorna platform na tabela de resultado (compatível: coluna extra; clientes JSON ignoram chaves novas).
--
-- Nota: não é possível alterar o tipo de retorno (RETURNS TABLE) com CREATE OR REPLACE; é preciso dropar primeiro.

drop function if exists public.pair_screen_by_code(text, text, text, text, text);

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
  paired boolean,
  platform text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_screen public.screens;
  v_effective_platform text;
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

  v_effective_platform :=
    case
      when p_platform is not null and lower(trim(p_platform)) in ('android', 'tizen') then lower(trim(p_platform))
      when lower(trim(coalesce(v_screen.platform, ''))) in ('android', 'tizen') then lower(trim(v_screen.platform))
      else 'android'
    end;

  update public.screens
  set device_fingerprint = p_device_fingerprint,
      platform = v_effective_platform,
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
    jsonb_build_object(
      'device_fingerprint', p_device_fingerprint,
      'player_version', p_player_version,
      'platform', v_effective_platform
    )
  );

  return query
  select v_screen.id, v_screen.organization_id, v_screen.unit_id, v_screen.name, true, v_effective_platform;
end;
$$;

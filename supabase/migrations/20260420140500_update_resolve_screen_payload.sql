-- Enriquece resolve_screen_payload: config da tela, playlist_version, fit_mode e is_active nos itens.

create or replace function public.resolve_screen_payload(
  p_screen_id uuid,
  p_at timestamptz default timezone('utc', now())
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_campaign record;
  v_payload jsonb;
begin
  select *
  into v_campaign
  from public.resolve_screen_campaign(p_screen_id, p_at)
  limit 1;

  if not found then
    return null;
  end if;

  select jsonb_build_object(
    'screen_id', s.id,
    'organization_id', s.organization_id,
    'campaign_id', c.id,
    'playlist_id', p.id,
    'playlist_version', coalesce(p.version, 1),
    'payload_version', coalesce(v_campaign.payload_version, md5(c.id::text || ':' || p.updated_at::text || ':' || coalesce(p.version::text, '1'))),
    'valid_until', c.end_at,
    'priority', c.priority,
    'orientation', s.orientation,
    'resolution', s.resolution,
    'screen_width', s.screen_width,
    'screen_height', s.screen_height,
    'aspect_ratio', s.aspect_ratio,
    'default_fit_mode', coalesce(s.default_fit_mode, 'cover'),
    'auto_scale_video', coalesce(s.auto_scale_video, true),
    'auto_scale_image', coalesce(s.auto_scale_image, true),
    'hide_overlay', coalesce(s.hide_overlay, true),
    'hide_controls', coalesce(s.hide_controls, true),
    'items', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', pi.id,
          'media_asset_id', ma.id,
          'media_type',
            case
              when ma.file_type ilike '%video%' or ma.mime_type ilike 'video/%' then 'video'
              when ma.file_type ilike '%html%' or ma.mime_type ilike 'text/html%' then 'html'
              when ma.file_type ilike '%banner%' then 'banner'
              else 'image'
            end,
          'media_url', coalesce(ma.public_url, ma.file_path),
          'thumbnail_url', ma.thumbnail_url,
          'duration_seconds', coalesce(pi.duration_override_seconds, ma.duration_seconds, 8),
          'position', pi.position,
          'fit_mode', coalesce(nullif(trim(pi.fit_mode), ''), 'cover'),
          'fit_mode_effective', coalesce(nullif(trim(pi.fit_mode), ''), coalesce(nullif(trim(s.default_fit_mode), ''), 'cover')),
          'is_active', coalesce(pi.is_active, true),
          'transition_type', pi.transition_type,
          'checksum', md5(coalesce(ma.file_path, ma.id::text) || ':' || coalesce(ma.updated_at::text, '')),
          'metadata', jsonb_build_object(
            'media_name', ma.name,
            'category', ma.category,
            'tags', ma.tags
          )
        )
        order by pi.position asc
      ),
      '[]'::jsonb
    )
  )
  into v_payload
  from public.screens s
  join public.campaigns c on c.id = v_campaign.campaign_id
  join public.playlists p on p.id = c.playlist_id
  join public.playlist_items pi on pi.playlist_id = p.id
  join public.media_assets ma on ma.id = pi.media_asset_id
  where s.id = p_screen_id
    and coalesce(pi.is_active, true) = true
    and ma.status in ('active', 'draft')
    and (ma.valid_from is null or ma.valid_from <= p_at)
    and (ma.valid_until is null or ma.valid_until >= p_at)
  group by s.id, s.organization_id, s.orientation, s.resolution, s.screen_width, s.screen_height,
    s.aspect_ratio, s.default_fit_mode, s.auto_scale_video, s.auto_scale_image, s.hide_overlay, s.hide_controls,
    c.id, c.end_at, c.priority, p.id, p.updated_at, p.version, v_campaign.payload_version;

  return v_payload;
end;
$$;

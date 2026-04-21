-- Verifica colunas de exibicao em public.screens
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'screens'
  and column_name in (
    'screen_width',
    'screen_height',
    'aspect_ratio',
    'default_fit_mode',
    'auto_scale_video',
    'auto_scale_image',
    'hide_overlay',
    'hide_controls'
  )
order by column_name;

-- Verifica tabelas de atribuicao de playlist
select to_regclass('public.screen_playlist_assignments') as screen_playlist_assignments;
select to_regclass('public.screen_group_playlist_assignments') as screen_group_playlist_assignments;


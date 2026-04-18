-- Itens ordenados por playlist (para players consumirem sequência real).
-- Aplicar no Supabase após revisar FKs no teu projeto.

CREATE TABLE IF NOT EXISTS public.playlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL REFERENCES public.playlists (id) ON DELETE CASCADE,
  media_asset_id uuid NOT NULL REFERENCES public.media_assets (id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_position ON public.playlist_items (playlist_id, position);

ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.playlist_items IS 'Sequência de mídias por playlist; players leem via getScreenPlaylistPayload (service role).';

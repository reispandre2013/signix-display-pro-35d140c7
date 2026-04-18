-- Signix: multi-plataforma (Android TV / Tizen TV)
-- Idempotente: pode reexecutar em ambientes onde parte das colunas já exista.
-- Aplicar via Supabase SQL Editor ou `supabase db push` (CLI).

-- ---------------------------------------------------------------------------
-- pairing_codes: origem do pedido de código (player)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pairing_codes' AND column_name = 'player_platform'
  ) THEN
    ALTER TABLE public.pairing_codes ADD COLUMN player_platform text;
  END IF;
END $$;

COMMENT ON COLUMN public.pairing_codes.player_platform IS 'Plataforma que pediu o código: android | tizen | web';

-- ---------------------------------------------------------------------------
-- screens: canal de distribuição (opcional)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'screens' AND column_name = 'store_type'
  ) THEN
    ALTER TABLE public.screens ADD COLUMN store_type text;
  END IF;
END $$;

COMMENT ON COLUMN public.screens.store_type IS 'playstore | tizen | sideload | internal — informativo';

-- Garantir default lógico para screens antigas sem platform (apenas se coluna existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'screens' AND column_name = 'platform'
  ) THEN
    UPDATE public.screens SET platform = 'android' WHERE platform IS NULL OR platform = '';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Telemetria (escrita apenas via service role / server functions)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.screen_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id uuid NOT NULL REFERENCES public.screens (id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'unknown',
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  message text,
  payload_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_screen_logs_screen_created ON public.screen_logs (screen_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.screen_heartbeats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id uuid NOT NULL REFERENCES public.screens (id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'unknown',
  app_version text,
  network_status text,
  storage_status text,
  player_status text,
  current_campaign_id uuid,
  current_media_id uuid,
  free_storage_mb numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_screen_heartbeats_screen_created ON public.screen_heartbeats (screen_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.screen_sync_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id uuid NOT NULL REFERENCES public.screens (id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'unknown',
  sync_type text NOT NULL,
  sync_status text NOT NULL,
  items_downloaded integer,
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_screen_sync_screen_created ON public.screen_sync_history (screen_id, created_at DESC);

ALTER TABLE public.screen_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_sync_history ENABLE ROW LEVEL SECURITY;

-- Sem políticas públicas: anon/authenticated não acedem; service_role ignora RLS.

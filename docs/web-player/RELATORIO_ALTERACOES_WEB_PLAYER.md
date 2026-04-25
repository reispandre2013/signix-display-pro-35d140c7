# Relatório de alterações — Web Player

## Banco de dados

- Nova migration: `supabase/migrations/20260425150000_web_player_module.sql`
  - Campos web em `screens`.
  - Tabela `web_player_sessions`.
  - Índices e policies RLS.

## Edge Functions novas

- `supabase/functions/create-web-pairing-code/index.ts`
- `supabase/functions/validate-web-pairing/index.ts`
- `supabase/functions/activate-web-player/index.ts`
- `supabase/functions/web-player-sync/index.ts`
- `supabase/functions/web-player-heartbeat/index.ts`
- `supabase/functions/register-playback-log/index.ts`
- `supabase/functions/revoke-player-session/index.ts`
- `supabase/functions/refresh-player-token/index.ts`
- Shared helper: `supabase/functions/_shared/web-player.ts`

## Frontend / server

- Novas server functions: `src/lib/server/web-player.functions.ts`
- Rotas:
  - `src/routes/pair.tsx`
  - `src/routes/player.web.tsx`
  - `src/routes/player.$screenId.tsx`
  - `src/routes/display.$token.tsx`
- Administração de telas:
  - `src/routes/app.telas.tsx` com suporte Web Player no cadastro/filtros/ações.

## Resiliência

- Cache offline de payload e fila de logs via IndexedDB no runtime web.
- Service worker básico para cache de assets de mídia:
  - `public/web-player-sw.js`

## Hardening

- `web-player-sync` valida status de tela, organização, assinatura e licença.
- Suporte a revogação de sessão e bloqueio de sessão revogada.
- Suporte a token de exibição (`/display/:token`) com expiração.

## Programação avançada

- Resolver de playlist atualizado para reconhecer campanha emergencial por prioridade (`>=1000`):
  - `campaign_emergency` em:
    - `src/lib/server/screen-playlist-payload.ts`
    - `supabase/functions/_shared/screen-playlist-payload.ts`

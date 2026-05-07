# Pareamento automático – Android TV (APK)

Aplica-se **somente** ao player Android TV (APK Capacitor em `android/`). Os players Web e Tizen mantêm o fluxo atual de código de pareamento. Painel, playlists, campanhas, autenticação e layout permanecem intactos.

## 1. Banco de dados (migration)

Estender a tabela `player_devices` (já existente) sem quebrar o fluxo atual:

- `device_uuid text unique` — UUID gerado pelo APK (persistente).
- `device_name text` — definido pelo admin.
- `tv_model text`, `manufacturer text`, `app_version text`, `platform text default 'android_tv'`.
- `auto_register_status text check in ('pending','active','blocked')` — usado **apenas** quando o registro vier do auto-register Android.
- `last_seen timestamptz`.
- Índice em `device_uuid` e em `(auto_register_status)`.

RLS: admins/owners da org veem dispositivos; auto-register inicial cria linhas sem `organization_id` (org definida no momento da ativação pelo admin, igual ao fluxo atual de `screens`). Endpoint público de auto-register usa `supabaseAdmin` com validação.

## 2. Endpoints (TanStack server routes em `src/routes/api/public/devices/`)

Todos respondem JSON. Validação Zod. Sem autenticação de usuário (são chamados pelo APK), mas validam `device_uuid` + `token` quando aplicável.

- `POST /api/public/devices/auto-register`
  - Input: `{ device_uuid, app_version, tv_model, manufacturer, platform }`.
  - Se `device_uuid` existe → retorna `{ status, device_id, token? }` (restaura sessão se já `active`).
  - Se não existe → cria linha em `player_devices` com `auto_register_status='pending'`, retorna `{ status:'pending', device_id }`.

- `POST /api/public/devices/check-session`
  - Input: `{ device_uuid, token }`.
  - Compara hash SHA-256 do token com `auth_secret_hash`. Se válido e `active` → atualiza `last_seen` e retorna `{ status:'active', device_id, screen_id }`. Caso contrário → `{ status:'pending'|'blocked' }`.

- `POST /api/public/devices/activate` (chamado pelo painel admin via server function autenticada — ver §3)
  - Gera token permanente (32 bytes hex), grava `auth_secret_hash`, marca `auto_register_status='active'`, vincula a uma `screen` (criada ou existente) na org do admin.

## 3. Painel admin – "Dispositivos Pendentes"

Nova seção em `src/routes/app.unidades.tsx` (ou nova rota `app.dispositivos-pendentes.tsx`) listando `player_devices` com `auto_register_status='pending'` e `platform='android_tv'`. Para cada um:

- Mostrar `tv_model`, `manufacturer`, `app_version`, `device_uuid` (curto), `created_at`.
- Input para nome + select de organização/unidade + botão "Ativar".
- Server function `activateAndroidDevice` (admin-only via `requireSupabaseAuth` + verificação de role) cria a `screen`, vincula `player_devices.screen_id`, define `device_name`, troca status para `active`, retorna ok.

Não remove nem altera o fluxo de pareamento por código existente (usado por Web/Tizen).

## 4. APK Android (Capacitor)

Em `src/player/` adicionar caminho exclusivo Android:

- `src/player/services/android-auto-pair.ts`:
  - `getOrCreateDeviceUuid()` — lê de `@capacitor/preferences` (chave `signix.device_uuid`); se ausente, gera `crypto.randomUUID()` e grava.
  - `autoRegister()` — POST `/api/public/devices/auto-register` com info do device (via `@capacitor/device`).
  - `checkSession(token)` — POST `/api/public/devices/check-session`.
  - `pollUntilActive()` — quando pending, faz polling a cada 10s até ficar `active`, recebe token, persiste em Preferences.

- `src/player/hooks/use-player-runtime.ts` (ou `activation-screen.tsx`):
  - Detectar `Capacitor.isNativePlatform() && getPlatform()==='android'`.
  - Se Android: pular a tela de código e executar fluxo auto. Mostrar tela "Aguardando ativação no painel — UUID: XXXX" enquanto pending.
  - Se ativo: usar `device_id`+`token` para `resolvePlaylistWithDevice` (já existe).

- Web/Tizen continuam usando `activation-screen` com código.

## 5. Persistência e reconexão

- Token e `device_uuid` em `@capacitor/preferences` (não localStorage volátil).
- Ao iniciar: tenta `checkSession`; se ok → vai direto pro player. Se rede off → usa cache local (já existente em `media-cache.ts` / `sync-service.ts`).
- Retry exponencial em falha de rede; nunca limpa token automaticamente.

## 6. Não alterado

Web player, Tizen, código de pareamento manual, RLS de outras tabelas, layout do painel, rotas de campanhas/playlists/telas, auth admin.

## Detalhes técnicos

- Token: 32 bytes hex via `crypto.getRandomValues`, hash SHA-256 armazenado (`auth_secret_hash`), igual padrão atual de `device-auth.ts`.
- `platform` no DB diferencia origem; queries do painel filtram por `platform='android_tv' AND auto_register_status='pending'` para a nova tela.
- Migrations idempotentes (`add column if not exists`).
- Fallback: se APK Android antigo enviar código manual, fluxo atual continua funcionando (compatibilidade).

Confirma para eu implementar?
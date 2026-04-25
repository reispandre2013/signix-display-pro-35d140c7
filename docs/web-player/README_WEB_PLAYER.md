# Web Player (Stack Dedicada)

Este módulo adiciona pareamento e reprodução profissional para navegador, sem quebrar Android/Tizen.

## Rotas

- `/pair`: pareamento do navegador com código.
- `/player/web`: runtime fullscreen do Web Player.
- `/player/:screenId`: alias para `/player/web`.
- `/display/:token`: link direto de exibição (token).

## Edge Functions

- `create-web-pairing-code`
- `validate-web-pairing`
- `activate-web-player`
- `web-player-sync`
- `web-player-heartbeat`
- `register-playback-log`
- `revoke-player-session`
- `refresh-player-token`

## Fluxo de pareamento web

1. No painel, criar dispositivo e selecionar plataforma Web.
2. No dispositivo, abrir `/pair`.
3. Inserir código de pareamento.
4. O sistema cria sessão em `web_player_sessions`, grava token hash e ativa a tela.
5. O player abre em `/player/web` e começa o sync periódico.

## Kiosk / fullscreen

### Chrome / Edge (Windows, mini PC, TV Box)

- URL: `https://SEU_DOMINIO/player/web?screenId=...`
- Fullscreen: `F11`
- Kiosk (Chrome):
  - `chrome.exe --kiosk "https://SEU_DOMINIO/player/web?screenId=..."`
- Kiosk (Edge):
  - `msedge.exe --kiosk "https://SEU_DOMINIO/player/web?screenId=..." --edge-kiosk-type=fullscreen`

### Smart TV browser / Raspberry Pi

- Abrir `/display/:token` ou `/player/web?...`.
- Fixar navegador em tela cheia.
- Configurar auto-start do navegador no boot do sistema.

## Segurança aplicada

- Sem uso de `service_role` no frontend.
- `web-player-sync` valida tela, organização, status da tela, assinatura/licença.
- Sessão revogada bloqueia acesso.
- `display_token` possui expiração.

## Debug oculto

- Atalho: `Ctrl + Shift + D` no `/player/web`.
- Exibe `screen_id`, playlist, campanha, sync/heartbeat e estado de conexão.

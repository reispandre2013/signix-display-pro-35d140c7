# Signix Android TV Player

APK Kotlin nativo para Android TV: pareamento permanente, ExoPlayer, kiosk (Lock Task), auto-start no boot, cache offline e sincronização contínua com o backend SigPlayer.

## Pré-requisitos backend

Antes de compilar/instalar:

1. Aplique o SQL `docs/supabase/migration-android-tv-player.sql` no Supabase (SQL Editor).
2. Endpoints públicos já criados no projeto Lovable:
   - `POST /api/public/android/register`
   - `POST /api/public/android/sync`
   - `POST /api/public/android/heartbeat`
3. UI de pareamento: botão **Vincular Android TV** na página `/app/telas`.

## Como compilar

1. Abra esta pasta `android-tv/` no Android Studio (Hedgehog ou superior).
2. Edite `app/src/main/java/com/signix/tvplayer/Config.kt` e ajuste:
   - `BASE_URL` → URL pública do seu painel (ex: `https://www.sigplayer.com.br`).
3. Build → **Generate Signed APK** (release).
   - O projeto está configurado para gerar **um APK universal**, evitando conflito de ABI no Android Studio.
4. Instale via `adb install -r app-release.apk` ou USB stick.

## Fluxo na TV

1. Primeira execução: APK gera `device_uuid`, salva em EncryptedSharedPreferences, chama `/register` e exibe um código de 6 dígitos.
2. Admin entra no painel → **Telas → Vincular Android TV** → digita o código + escolhe a tela.
3. APK detecta `paired=true` no próximo poll, baixa playlist e entra em modo kiosk full-screen.
4. Reboot da TV: `BOOT_COMPLETED` reabre o app, restaura o token salvo, **NUNCA** pede código novamente.

## Arquitetura

- **Kotlin + ExoPlayer (Media3)** para vídeos/imagens.
- **EncryptedSharedPreferences** para token permanente.
- **WorkManager** para sync e heartbeat em background.
- **Lock Task Mode** (kiosk) — esconde barras, bloqueia saída.
- **OkHttp** + cache em disco para mídias (offline).
- **Foreground Service** + `BootReceiver` para auto-start.

## Saída de emergência

Pressione **VOLUME_UP 5x em 3 segundos** para sair do Lock Task (apenas para manutenção técnica).

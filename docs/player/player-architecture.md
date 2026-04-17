# Player Profissional (Indoor Smart TV / Digital Signage)

## Estrutura implementada

- `src/player/components`
  - `activation-screen.tsx`
  - `loading-screen.tsx`
  - `playback-screen.tsx`
  - `fallback-screen.tsx`
  - `admin-overlay.tsx`
- `src/player/hooks`
  - `use-player-runtime.ts`
  - `use-network-status.ts`
- `src/player/services`
  - `player-api.ts`
  - `sync-service.ts`
  - `media-cache.ts`
  - `log-queue.ts`
- `src/player/storage`
  - `idb.ts`
  - `player-local.ts`
- `src/player/validators`
  - `payload-validator.ts`

## Fluxo operacional

1. Player inicia em fullscreen.
2. Sem credencial local: abre tela de pareamento.
3. Com credencial: sincroniza programação.
4. Se sync remoto falhar: usa payload em cache.
5. Se sem payload: fallback amigável.
6. Reprodução em loop com watchdog para evitar travamento.
7. Heartbeat periódico + fila de logs de reprodução.
8. Quando rede volta: flush automático de logs pendentes.

## Recursos de resiliência

- Cache local de payload e mídias em IndexedDB.
- Retry automático de sync por intervalo.
- Retry de envio de logs com fila local.
- Skip de item em falha de mídia.
- Watchdog para evitar tela presa.
- Modo fallback sem tela preta permanente.
- Em ambiente com Supabase configurado, usa apenas payload remoto + cache local real (sem fallback mock).

## Operação administrativa (tecla D)

- Exibe status de rede, versão e último sync.
- Ajuste de intervalos heartbeat/sync.
- Re-sincronizar, limpar cache e reiniciar player.
- Reset de pareamento local.

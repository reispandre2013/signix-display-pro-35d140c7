# Edge Functions

## `pair-screen`

- Entrada: `pairingCode`, `deviceFingerprint`, `platform`, `osName`, `playerVersion`
- Ação: valida código, vincula fingerprint, invalida código.
- Saída: objeto da tela pareada.

## `heartbeat-screen`

- Entrada: `screenId`, metadados técnicos.
- Ação: registra heartbeat e atualiza status da tela.
- Saída: `{ ok: true }`.

## `resolve-screen-playlist`

- Entrada: `screenId`.
- Ação: resolve campanha ativa por período, agenda, alvo e prioridade e monta payload completo com itens da playlist.
- Saída: payload de player (`screen_id`, `organization_id`, `campaign_id`, `playlist_id`, `payload_version`, `items`).

## `publish-campaign`

- Entrada: `campaignId`.
- Ação: muda campanha para `active`.
- Saída: campanha atualizada.

## `media-postprocess`

- Entrada: `mediaAssetId`, `thumbnailUrl`, `publicUrl`.
- Ação: atualiza metadados pós-processamento de mídia.
- Saída: mídia atualizada.

## `generate-proof-of-play`

- Entrada: dados de playback + `localEventId`.
- Ação: grava playback com hash de prova (`proof_hash`) e idempotência.
- Saída: `proofHash`.

## `export-report`

- Entrada: `organizationId`, `from`, `to`.
- Ação: exporta playback do período.
- Saída: linhas de relatório para CSV/BI.

## `send-alert`

- Entrada: `organizationId`, `screenId`, `alertType`, `severity`, `message`.
- Ação: cria alerta operacional.
- Saída: id do alerta.

## `daily-health-check`

- Entrada: header opcional `x-health-timeout-minutes`.
- Ação: marca telas offline por timeout e limpa órfãos.
- Saída: contadores de manutenção diária.

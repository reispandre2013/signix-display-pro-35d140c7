# Checklist de testes — Web Player

## Pareamento

- [ ] Criar dispositivo com plataforma Web Player no painel.
- [ ] Gerar código de pareamento.
- [ ] Abrir `/pair` em navegador limpo.
- [ ] Parear com sucesso e redirecionar para `/player/web`.
- [ ] Exibir erro para código expirado.

## Reprodução

- [ ] Reproduzir imagem.
- [ ] Reproduzir vídeo MP4 com autoplay.
- [ ] Reproduzir HTML custom.
- [ ] Validar `cover`.
- [ ] Validar `contain`.
- [ ] Validar `stretch`.
- [ ] Validar `center`.
- [ ] Validar `fit-width`.
- [ ] Validar `fit-height`.
- [ ] Validar orientação horizontal.
- [ ] Validar orientação vertical.

## Sync / operação

- [ ] Trocar playlist no painel e validar atualização no player.
- [ ] Trocar campanha e validar atualização.
- [ ] Validar atribuição por tela/grupo/unidade.
- [ ] Validar campanha de prioridade alta (emergencial).
- [ ] Validar fallback para última playlist em cache quando offline.
- [ ] Validar retorno online e resync sem recarregar manualmente.

## Telemetria e logs

- [ ] Heartbeat aparece no monitoramento.
- [ ] Status online/offline atualiza no painel.
- [ ] Logs de reprodução enviados (`started`, `ended`, `failed`).
- [ ] Com internet desligada, logs entram em fila local.
- [ ] Com internet retomada, logs pendentes são reenviados.

## Segurança e re-pareamento

- [ ] Revogar sessão web no painel.
- [ ] Validar bloqueio de player revogado.
- [ ] Validar troca de token (`refresh-player-token`).
- [ ] Validar bloqueio por assinatura/licença suspensa.
- [ ] Confirmar ausência de regressão no Android/Tizen.

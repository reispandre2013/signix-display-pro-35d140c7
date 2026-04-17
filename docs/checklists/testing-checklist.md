# Checklist de Testes

- [ ] Login com Supabase em cenário válido e inválido.
- [ ] Redirecionamento para `/login` quando sessão expira.
- [ ] Pareamento com código válido, inválido e expirado.
- [ ] Heartbeat atualizando `last_seen_at` e estado online.
- [ ] Mudança automática para offline por timeout.
- [ ] Resolução de campanha respeitando prioridade e agendamento.
- [ ] Registro de sync com sucesso e falha.
- [ ] Registro de playback com `proof_hash` e idempotência por `local_event_id`.
- [ ] Exportação de relatório por período e organização.
- [ ] Verificação de isolamento multiempresa em queries e storage.

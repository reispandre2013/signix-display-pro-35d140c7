# Checklist de Produção

- [ ] Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no frontend.
- [ ] Configurar `SUPABASE_SERVICE_ROLE_KEY` apenas em Edge Functions.
- [ ] Aplicar migrations em ambiente de staging e validar rollback.
- [ ] Publicar buckets e policies de storage.
- [ ] Publicar todas as Edge Functions obrigatórias.
- [ ] Configurar cron para `daily-health-check`.
- [ ] Habilitar monitoramento de erros e latência por função.
- [ ] Validar limites de payload para players com baixa conectividade.
- [ ] Rodar smoke tests de login, pareamento, playback e relatório.
- [ ] Validar fallback mock em ambiente sem env Supabase.

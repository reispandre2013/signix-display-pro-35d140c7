# Checklist de Segurança

- [ ] RLS habilitada em todas as tabelas sensíveis.
- [ ] Policies revisadas por perfil (`admin_master`, `gestor`, `operador`, `visualizador`).
- [ ] Nenhuma chave `service_role` em código frontend ou repositório.
- [ ] `pair_screen_by_code` com expiração e invalidação de código.
- [ ] Validação de `organization_id` em leitura e escrita.
- [ ] Auditoria habilitada para `screens`, `media_assets`, `playlists`, `campaigns`.
- [ ] Buckets com limite de tamanho e MIME types restritos.
- [ ] Tráfego de funções apenas por HTTPS.
- [ ] Revisão de permissões de exportação de relatórios.
- [ ] Rotina de revisão mensal de permissões e logs.

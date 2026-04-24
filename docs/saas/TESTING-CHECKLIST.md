# Checklist de testes — SaaS + Signage

Aplicar após `supabase db push` e deploy das Edge Functions (se usadas).

## Papel e RLS

- [ ] `super_admin` lê qualquer `organizations` e tabelas tenant.
- [ ] Utilizador normal só lê/altera a própria org.
- [ ] `visualizador` consegue `select` e não consegue `insert/update/delete` em conteúdo com política `operador+` (já existente no core).
- [ ] `master` (`admin_master`/`gestor`) gere utilizadores e billing **apenas** na sua org (UI + RLS de leitura em subscriptions/invoices).
- [ ] Mutação em `subscriptions` / `payments` / `licenses` a partir de cliente como não-super: deve falhar (só leitura); webhooks e jobs usam service role.

## RPC

- [ ] `get_user_saas_context` com JWT de utilizador normal devolve `organization`, `plan`, `license`, `usage` quando houver linhas.
- [ ] `get_user_saas_context` com `super_admin` devolve `is_platform_admin: true`.
- [ ] `check_plan_limit` com org de outro user (sem `super_admin`) → erro.
- [ ] `refresh_usage_counters` alinha contagens com telas, perfis, playlists, campanhas, tamanho de mídias.

## Signage (regressão)

- [ ] Pareamento / player / campanhas / playlists inalterados em fluxo feliz.
- [ ] Acessos a `screen_playlist_assignments` e `screen_group_playlist_assignments` com `super_admin` e operador de org.

## Pagamentos (stub)

- [ ] `payment-webhook` com `PAYMENT_WEBHOOK_SECRET` e JSON com `organization_id` insere linha em `payments`.
- [ ] Sem secret configurado, webhook aceita (ambiente de dev) ou recusa, conforme implementação (ver env).

## Front

- [ ] `useRole` mapeia `super_admin` para painel SaaS (`Sidebar` já condiciona `isSuperAdmin`).

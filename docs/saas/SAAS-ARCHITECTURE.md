# Arquitectura SaaS Signix

## Visão geral

- **Multitenant** por `organization_id` em toda tabela sensível. `super_admin` (enum `app_role`) acede a todas as linhas vía `is_platform_admin()`.
- **Papéis**:
  - `super_admin` — plataforma (SaaS Admin no UI).
  - `admin_master` / `gestor` — mapeados para *master* no frontend (`useRole`).
  - `operador` / `visualizador` — inalterados; RLS restringe escrita a `operador+` onde já existia.

## Dados (Postgres)

| Tabela | Notas |
|--------|--------|
| `permission_catalog` | Chaves lógicas (`dashboard.view`, `billing.view`, …). |
| `role_permissions` | Permissão por valor de `app_role`. |
| `user_permissions` | Override por `profile_id` (master ajusta operador). |
| `plans` | Preços em centavos; `slug` + limites (telas, users, storage MB, playlists, campanhas). |
| `subscriptions`, `invoices`, `payments`, `licenses`, `checkout_sessions`, `usage_counters`, `saas_settings` | Billing e uso. Mutação via **service role** (Edge) ou `super_admin` na UI; leitura na organização. |

## Funções (RPC / SECURITY DEFINER)

- `get_user_saas_context()` — contexto do utilizador com JWT.
- `refresh_usage_counters(org)` — recalcula contadores; valida `auth` vs org.
- `check_plan_limit(org, kind, by)` — valida antecedamente limites; valida `auth` vs org.

## Edge Functions

| Função | Papel |
|--------|--------|
| `get-saas-context` | Chama `get_user_saas_context` com o JWT. |
| `create-checkout-session` | Stub: cria `checkout_sessions` (service role após verificar user). |
| `payment-webhook` | Stub: grava `payments`; activação de licença/subscription: **TODO** (ver código). |
| `validate-plan-limits` | Chama `check_plan_limit` com org do perfil. |

## Trocar provedor de pagamento

1. Implementar `PaymentProviderAdapter` em `src/lib/saas/payment-providers.ts`.
2. No `payment-webhook`, chamar `verifyRequest` e `parseEvent` e, em sucesso, transaccionar licença + subscription + audit (service role, idempotente).

## Criar o primeiro `super_admin`

1. Aplicar migrations.
2. No SQL Editor, actualizar o perfil desejado: `update profiles set role = 'super_admin' where id = '…'`.

Não deixe `service_role` no browser.

## Compatibilidade

- Tabelas de signage (telas, playlists, campanhas, mídias, player) **não** foram removidas.
- `docs/supabase/migration-saas-billing.sql` passou a ser **referência**; a migration oficial é `20260424200000_saas_platform_layer.sql`.

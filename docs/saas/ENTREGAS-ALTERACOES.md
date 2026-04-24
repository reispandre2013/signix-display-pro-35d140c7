# Relatório de alterações — plataforma SaaS

## Resumo

Foi adicionada uma **camada SaaS** alinhada ao core existente (Signix), sem remover tabelas ou rotas de signage. A migration `20260424200000_saas_platform_layer.sql` cria/amplia tabelas de planos, assinaturas, faturas, licenças, pagamentos, checkout, contadores, catálogo de permissões, e funções de contexto/ limites. As políticas RLS do **ficheiro inicial** foram reescritas para permitir acesso de **super_admin** a todo o dado, e a leitura de assinaturas/faturas na org sem permitir a mutação a partir de utilizador tenant (apenas leitura; mutação via serviço ou super admin).

## Ficheiros novos (principais)

- `supabase/migrations/20260424200000_saas_platform_layer.sql` — schema + RLS + seeds + funções.
- `supabase/functions/get-saas-context/`, `create-checkout-session/`, `payment-webhook/`, `validate-plan-limits/`.
- `src/lib/saas/permissions-helpers.ts`, `src/lib/saas/payment-providers.ts` (interface de provedor).
- `src/lib/server/saas.functions.ts` — `getUserSaasContext` (TanStack Start).
- `docs/saas/SAAS-ARCHITECTURE.md`, `docs/saas/TESTING-CHECKLIST.md`, `docs/saas/ENTREGAS-ALTERACOES.md` (este ficheiro).

## Ficheiros alterados

- `src/lib/db-types.ts`, `src/types/domain.ts` — `AppRole` inclui `super_admin`.
- `src/lib/use-role.ts` — mapeamento directo de `super_admin` (sem cast).
- `docs/supabase/migration-saas-billing.sql` — nota a apontar para a migration canónica.

## O que ainda depende de integração manual

- Activar licença + subscription a partir de `payment-webhook` (hoje só `payments` stub).
- Convites de utilizador (`invite-user` / `accept-invite`) — não adicionado como serviço completo; pode usar `public-signup` + `profiles` existentes.
- `create-checkout-session` preenche `checkout_url` com URL real do Stripe/Mercado Pago/Asaas.

## Não feito (e não solicitado a alterar em massa)

- Substituir `saas-mock.ts` no painel de planos por consultas reais a `plans` (o mock continua a funcionar até trocar as queries no UI).

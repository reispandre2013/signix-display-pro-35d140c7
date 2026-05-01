# Auditoria de segurança — SigPlayer (Signix Display Pro)

**Data:** 2026-04-30  
**Âmbito:** Repositório `signix-display-pro` (TanStack Router, Supabase, Edge Functions).  
**Regra aplicada:** Corrigir com **mínima invasão**; não remover funcionalidades.

---

## 1. Sumário executivo

O modelo multi-tenant está **bem fundamentado em RLS** na maioria das tabelas core (`profiles`, `screens`, `media_assets`, `campaigns`, etc.), isolamento por `organization_id`, e papel `super_admin` com `is_platform_admin()`.

Principais riscos identificados (antes desta revisão):

| Área | Risco |
|------|--------|
| **Financeiro direto na API** | Qualquer utilizador da org podia fazer SELECT em **invoices** e **payments** com a `anon`/sessão JWT. |
| **`resolve-screen-playlist`** | Resolução por `screenId` sem credencial de dispositivo permite obter playlists se um UUID ou fluxo legacy for exposto. |
| **CORS** | Várias funções Edge usam `Access-Control-Allow-Origin: *`. |
| **RPC `get_user_saas_context`** | `SECURITY DEFINER` devolve subscrição, licença e plano **completos** a todos os membros da org (independente das policies RLS sobre tabelas). |
| **`logos`** | Bucket **público** por defeito (`public=true` nas migrações). |

---

## 2. Correções aplicadas nesta auditoria

| ID | Alteração | Ficheiro / artefacto |
|----|-----------|----------------------|
| C1 | Policies RLS: **invoices** e **payments** SELECT apenas para quem tenha papel ≥ gestor (`has_role('gestor')`) na própria org, ou **super_admin** (`is_platform_admin()`). | `supabase/migrations/20260430103000_rls_restrict_billing_to_gestor.sql` |
| C2 | `resolve-screen-playlist`: aceitar `device_id` + `auth_token` no corpo com a mesma validação que `device-resolve-playlist` (extract `_shared/device-player-auth.ts`). | `supabase/functions/resolve-screen-playlist/index.ts`, `_shared/device-player-auth.ts` |
| C3 | Flag opcional de endurecimento: `DENY_LEGACY_SCREEN_UUID_RESOLVE=true` recusa apenas `screenId`/`screen_id` sem código de pareamento nem credencial de dispositivo (players antigos continuam até ativar esta env). | `resolve-screen-playlist/index.ts` |
| C4 | CORS configurável opcionalmente: `FUNCTIONS_ALLOWED_ORIGINS` (lista separada por vírgulas; vazio/`\*` preserva comportamento anterior). Helper partilhado utilizado já em **resolve-screen-playlist**. | `supabase/functions/_shared/cors-env.ts`, `resolve-screen-playlist/index.ts` |
| C5 | `device-resolve-playlist`: validação centralizada (`assertDevicePlayerForScreen`). | `_shared/device-player-auth.ts`, `device-resolve-playlist/index.ts` |

**Deploy obrigatório:** aplicar a migração SQL no projeto Supabase e **reimplementar as Edge Functions** alteradas (`resolve-screen-playlist`, `device-resolve-playlist`). Definir em produção, quando aplicável:

- `DENY_LEGACY_SCREEN_UUID_RESOLVE=true` (após garantir que players legados utilizam **`device-resolve-playlist`** ou enviam token em `resolve-screen-playlist`).
- `FUNCTIONS_ALLOWED_ORIGINS=https://app.seudominio.com` (URLs de preview conforme necessidade).

---

## 3. Vulnerabilidades / gaps remanescentes (prioridade)

### 3.1 Alta

1. **`get_user_saas_context()`** devolve objetos JSON completos de **subscription**, **license**, **plan** a qualquer membro da org. Para alinhar estritamente à política «operador não vê dados financeiros», é necessário **função sanitizada por peso de papel** (ex.: apenas limites/contadores para `operador`/`visualizador`). Não foi alterado para não partir ecrãs que dependem do payload atual.
2. **SELECT direto em `subscriptions` / `licenses`** continua disponível a todos os membros da organização conforme migrações anteriores. Quem quer confidencialidade total nos metadados de pagamento deve restringir também estas tabelas **e** ajustar a app para ler limites apenas via RPC segura ou `usage_counters`/plan público.

### 3.2 Média

3. **CORS `*`** mantém-se na maioria das funções até configuração fina (`FUNCTIONS_ALLOWED_ORIGINS`).
4. **Webhook Asaas**: `payment-webhook` permite origem `*`. O webhook é tipicamente server-to-server; o risco é baixo desde que autenticação secundária (token Asaas / `PAYMENT_WEBHOOK_SECRET` / JWT admin) esteja bem configurada — rever `payment-webhook/index.ts` antes de endurecer apenas CORS.
5. **`/player` demo** não expõe dados sem sessão quando `organization_id` é nulo (`useOrgId` disabled); apenas mostra PromoShowcase vazio ou conteúdo autenticado.

### 3.3 Baixa / operacional

6. **`player_devices`** com RLS ativo mas sem políticas para `authenticated` → acesso apenas via **service_role** nas funções Edge (adequado para segredos de dispositivo).
7. **Android bundling**: referências texto a `SERVICE_ROLE*` em artefactos `android/...` são compilados da stack; garantir builds de produção **nunca** incluem `.env` com segredos.
8. **Bucket `logos` público**: aceitável para branding; garantir naming imprevisível (`org_uuid/…`) quando possível.

---

## 4. Inventário rápido (conformidade com o checklist)

### 4.1 Supabase Auth & frontend

| Verificação | Estado |
|-------------|--------|
| Rotas `/app/*` redireccionam sessão ausente (`beforeLoad`) | ✅ `app.tsx` |
| Área SaaS apenas `super_admin` com ambiente configurado | ✅ `admin-saas.tsx` |
| `RouteGuard` + mapa por módulos | ⚠️ rotas não mapeadas em `route-permissions.ts` caem como «sem guard de módulo» (ex.: raiz `/app`/índices) |
| `service_role` no browser | ✅ não (apenas servidor / Edge `_shared/client.ts`) |

Rotas públicas típicas: `/`, `/vendas`, `/login`, `/signup`, `/checkout`, `/planos`, `/recuperar-senha`, `/reset-password`, `/player*` (playback), `/pair`, `/pareamento`, `/display/$token`, `/configurar`, `/player-screen`, etc. Lista exacta deve ser revista quando quiser apenas o conjunto mínimo de públicas declarado no backlog.

### 4.2 RLS (amostragem já existente no repo)

RLS ligado nas tabelas core e SaaS conforme migrações `20260417120000_init_signix_core.sql`, `20260424200000_saas_platform_layer.sql`.

Operações `<gestor`: **bloqueadas** apenas em **writes** onde `has_role('operador')`; **viewer** só lê onde policy permite membros da org (`select`). **Financeiro granular:** ✅ **payments/invoices** restringidas a gestor+ nesta revisão.

### 4.3 Storage

- Buckets declarados com `allowed_mime_types` e limite de tamanho ✅  
- Policies exigem `organization_id` em metadata (fallback `current_organization_id`) ✅  
- Risco residual: objeto com `organization_id` metadata adulterado no pedido deve ser tratado também na camada de aplicação (metadados vêm do cliente).

### 4.4 Edge Functions

- **`device-resolve-playlist`** / **`pair-screen`**: autenticação por dispositivo ✅  
- **`resolve-screen-playlist`**: até `DENY_LEGACY_SCREEN_UUID_RESOLVE=true`, mantém cenário legacy ⚠️  
- **`register-playback-log`** (web): `validateWebSession` ✅  

### 4.5 Webhooks

- Verificar em produção: token Asaas, `PAYMENT_WEBHOOK_SECRET`, idempotência (eventos/processamento duplo) já referidos em conversas precedentes sobre `payment-webhook`.

---

## 5. Checklist de validação manual (SEG)

1. [ ] Utilizador deslogado abre `/app` → redirect login.  
2. [ ] `operador` abre `/app/faturas` → UI pode mostrar erro de dados OU RLS impedir selects (ideal: UI já escondida pelo `RouteGuard`).  
3. [ ] `visualizador` tenta mutação em Supabase sobre campanhas → RLS deve falhar mesmo que console force.  
4. [ ] `gestor` numa organização não lê dados de `organization_id` alheio nas tabelas sensíveis.  
5. [ ] Device revogado: `device-resolve-playlist` e `resolve-screen-playlist` com auth → 401/403.  
6. [ ] Upload tipo `.exe` rejeitado pelo bucket MIME.  
7. [ ] Payload webhook simulado sem segredo esperado é rejeitado (conforme config).  
8. [ ] Frontend build sem `SERVICE_ROLE_KEY` nos bundles públicos (`grep` pipelines).  

---

## 6. Referências técnico-funcionais

- `payment-webhook`: `supabase/functions/payment-webhook/index.ts`  
- RLS SaaS principal: `supabase/migrations/20260424200000_saas_platform_layer.sql`  
- Auth layout app: `src/routes/app.tsx`, `admin-saas.tsx`  
- Perfil efectivo/UI: `src/lib/use-role.ts`, `RouteGuard.tsx`, `route-permissions.ts`

---

*Documento criado pela auditoria 2026-04; alterações código referidas na secção 2.*

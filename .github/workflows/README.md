# GitHub Actions — Deploy de Edge Functions

Este diretório contém workflows automatizados para o projeto Signix.

## 📦 `deploy-edge-functions.yml`

Faz deploy automático das Edge Functions do Supabase relacionadas a pagamentos
(`create-checkout-session` e `payment-webhook`) sempre que o código delas é alterado.

### Quando dispara

- **Automático**: push na branch `main` que altere arquivos em:
  - `supabase/functions/create-checkout-session/**`
  - `supabase/functions/payment-webhook/**`
  - `supabase/functions/_shared/**`
- **Manual**: aba **Actions** → **Deploy Supabase Edge Functions** → **Run workflow**
  (permite escolher uma função específica ou deployar todas).

### 🔐 Secrets necessárias no GitHub

Configure em: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Onde obter | Exemplo |
|--------|------------|---------|
| `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens → **Generate new token** | `sbp_xxx...` |
| `SUPABASE_PROJECT_REF` | URL do dashboard: `dashboard/project/<REF>` | `auhwylnhqmdgphsvjszr` |

> ⚠️ **`SUPABASE_ACCESS_TOKEN`** é um token pessoal da sua conta Supabase, **diferente** de `SERVICE_ROLE_KEY` ou `ANON_KEY`. Ele permite que a CLI faça deploy em seu nome.

### ✅ Como testar

1. Configure as duas secrets acima.
2. Vá na aba **Actions** do GitHub → **Deploy Supabase Edge Functions** → **Run workflow** → escolha a branch `main` → **Run**.
3. Acompanhe os logs. Ao final, deve aparecer "✅ Deploy concluído com sucesso".
4. Confirme em: https://supabase.com/dashboard/project/<REF>/functions

### 🔄 Fluxo recomendado

```
Editar supabase/functions/create-checkout-session/index.ts
         ↓
git push origin main
         ↓
GitHub Actions detecta mudança no path
         ↓
Deploy automático no Supabase
         ↓
Função atualizada em produção
```

### ❓ Troubleshooting

- **`SUPABASE_ACCESS_TOKEN não configurada`**: adicione a secret nas Settings do repo.
- **`Project not found`**: confira o `SUPABASE_PROJECT_REF` (sem barras, só o ID).
- **`401 Unauthorized`**: o access token expirou ou foi revogado — gere um novo.
- **Função não aparece após deploy**: aguarde 30s, atualize o dashboard. Se persistir, veja os logs do step "Deploy das Edge Functions".

### ➕ Adicionar mais funções ao deploy

Edite `deploy-edge-functions.yml`:

1. Adicione o path em `on.push.paths`.
2. Adicione o nome em `options` (workflow_dispatch).
3. Adicione no fallback de `steps.functions.outputs.list`.

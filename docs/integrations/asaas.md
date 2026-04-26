# Integração com Asaas (cobranças e assinaturas)

O Signix cria assinaturas no Asaas via Edge Function `create-checkout-session` e trata o retorno e webhooks no `payment-webhook`.

## Variáveis (secrets na Supabase e local para `supabase functions serve`)

| Variável                                     | Descrição                                                                                                                                                                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ASAAS_API_KEY`                              | Chave da API (formato `$aact_...`). [Sandbox e produção](https://docs.asaas.com) são chaves e URLs diferentes; se a chave for de **produção** e o padrão continuar sandbox, o Asaas devolve _«A chave de API informada não pertence a este ambiente»_. |
| `ASAAS_API_BASE`                             | Opcional. Padrão `https://api-sandbox.asaas.com`. **Produção:** `https://api.asaas.com` (obrigatório alinhar com a chave).                                                                                                                             |
| `ASAAS_ENV`                                  | Opcional. Se `ASAAS_API_BASE` não estiver definido: `production` / `prod` / `live` → `https://api.asaas.com`; caso contrário mantém-se o sandbox.                                                                                                      |
| `ASAAS_WEBHOOK_TOKEN`                        | O mesmo valor que configurou no Asaas no webhook como **“Token de autenticação”**; o Asaas envia o header `asaas-access-token` em cada requisição.                                                                                                     |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Já exigidos pelas funções.                                                                                                                                                                                                                             |

**Sem** `ASAAS_API_KEY`, a função de checkout cria só registo `stub` em `checkout_sessions` (útil em desenvolvimento local sem cobranças reais).

## Configurar o webhook no Asaas

1. URL do Supabase: `https://<ref>.supabase.co/functions/v1/payment-webhook`
2. Selecione eventos de cobrança (mínimo: `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`).
3. Defina o **Token de autenticação** com o mesmo valor de `ASAAS_WEBHOOK_TOKEN`.
4. Após o deploy, teste a partir do sandbox do Asaas.

A função rejeita pedidos de webhook se o token não bater. O payload segue a [documentação de eventos de cobrança](https://docs.asaas.com/docs/webhook-para-cobrancas).

## Fluxo resumido

1. O utilizador, autenticado, preenche o checkout (incl. **CPF/CNPJ** obrigatório para o Asaas).
2. O backend cria ou reutiliza o `cus_` do cliente, grava o ID em `organizations.asaas_customer_id` e cria a assinatura com `POST /v3/subscriptions` (`externalReference` = id da `checkout_sessions`).
3. Quando a primeira (ou sucessiva) cobrança for paga, o Asaas chama o webhook: gravamos o **pagamento** em `payments`, a **fatura** em `invoices` (espelhando `pay_` com `external_id`, URLs do carné quando o payload traz), ligamos `payments.invoice_id` e, na primeira ativação, a **assinatura** e **licença**; a sessão de checkout passa a `succeeded`.
4. **Renovação**: cobranças mensais/ anuais seguintes reutilizam a mesma `sub_` no Asaas; o webhook cria novas linhas de pagamento e fatura, sem duplicar a `subscriptions` interna.

### Testar no sandbox (resumo)

1. Defina `ASAAS_API_KEY` (sandbox) e `ASAAS_API_BASE=https://api-sandbox.asaas.com` nas **Secrets** do projeto Supabase.
2. Faça `deploy` das funções e aplique as migrations.
3. Crie o webhook do Asaas apontando para o URL da `payment-webhook` e o mesmo `ASAAS_WEBHOOK_TOKEN` que configurou.
4. Com um utilizador com **organização** e CPF de teste válido no checkout, conclua o fluxo.
5. No Supabase, confirme: `public.payments` (cada `pay_` uma linha), `public.invoices` (número `ASAAS-{pay_…}`), `public.subscriptions` com `external_subscription_id = sub_…`.
6. Se o `invoiceUrl` não vier de imediato no checkout, a cobrança pode ser consultada no painel do Asaas; o carné costuma ser listado com pequeno atraso após a criação da assinatura.

Ajuste fino de faturas, impostos e reembolsos deve acompanhar as regras da sua contabilidade e da API do Asaas.

## Referência

- [Criar assinatura](https://docs.asaas.com/docs/criando-uma-assinatura)
- [Webhooks](https://docs.asaas.com/docs/receive-asaas-events-at-your-webhook-endpoint)

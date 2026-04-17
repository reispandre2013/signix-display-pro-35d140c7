# AGENTS - Signix Display Pro

## Objetivo
Este projeto implementa uma plataforma de Digital Signage multiempresa com frontend React e backend Supabase.

## Regras críticas
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no frontend.
- Toda tabela sensível deve usar `organization_id`.
- RLS obrigatória em tabelas de domínio.
- Ações críticas devem gerar `audit_logs`.
- Alterações no frontend devem preservar layout e navegação existentes.
- Em ambiente sem variáveis do Supabase, manter fallback para modo mock.

## Estrutura esperada
- `supabase/migrations`: schema, RLS, automações SQL.
- `supabase/functions`: funções Edge para fluxos sensíveis.
- `src/integrations/supabase`: client frontend (anon key).
- `src/services` e `src/repositories`: camada de acesso a dados.
- `docs/supabase`: documentação operacional e técnica.

## Fluxos obrigatórios
- Pareamento seguro de telas com expiração de código.
- Heartbeat periódico e transição online/offline automática.
- Resolução de campanha por prioridade, período e alvo.
- Registro de playback com hash de prova.
- Exportação de relatórios via função segura.

## Qualidade e operação
- Migrations idempotentes e com índices.
- Edge Functions com validação de payload e respostas padronizadas.
- Checklist de segurança, produção e testes atualizado a cada release.

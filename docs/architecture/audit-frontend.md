# Auditoria do Frontend Existente

## Escopo analisado

- Rotas em `src/routes`
- Layout em `src/components/layout`
- UI kit em `src/components/ui-kit`
- Dados mock e tipos em `src/lib/mock-data.ts`

## Estado encontrado

- Frontend visual completo, com múltiplas telas de operação.
- Navegação pronta por TanStack Router (`/`, `/login`, `/app/*`, `/player`, `/pareamento`).
- Dados eram 100% mockados localmente.
- Sem integração com Supabase, sem autenticação real, sem políticas de acesso reais.

## Mapeamento de módulos

- Monitoramento: `app.monitoramento.tsx`
- Telas e grupos: `app.telas.tsx`, `app.grupos.tsx`
- Mídias, playlists, campanhas: `app.midias.tsx`, `app.playlists.tsx`, `app.campanhas.tsx`
- Agendamentos e preview: `app.agendamentos.tsx`, `app.preview.tsx`
- Governança: `app.alertas.tsx`, `app.auditoria.tsx`, `app.relatorios.tsx`, `app.configuracoes.tsx`

## Lacunas que impediam produção

- Ausência de banco relacional real.
- Ausência de isolamento multiempresa.
- Ausência de RBAC por perfil.
- Ausência de fluxo seguro de pareamento de player.
- Ausência de heartbeat, sync log e prova de exibição.
- Ausência de trilha de auditoria persistente.

## Diretriz de compatibilidade aplicada

- Nenhuma rota visual foi removida.
- Layout e navegação foram preservados.
- Login e proteção de `/app` agora suportam Supabase, com fallback mock sem quebrar preview.

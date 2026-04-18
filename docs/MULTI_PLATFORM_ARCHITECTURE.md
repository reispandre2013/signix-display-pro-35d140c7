# Arquitetura multi-plataforma (Android TV + Tizen TV) — Signix

Documento técnico: diagnóstico do estado atual, plano de migração sem regressão, contratos de API e checklist operacional.

---

## 1. Como o sistema atual funciona

### Stack

- **Painel + API de aplicação:** monorepo `signix-display-pro` (TanStack Start / React, Vite, deploy Cloudflare).
- **Dados e auth:** **Supabase** (Postgres + Auth + RLS). O código trata `screens` como o registro físico do player (“dispositivo”).
- **Operações privilegiadas:** `createServerFn` em `src/lib/server/*.functions.ts` usando `supabaseAdmin` (service role) para contornar RLS onde o fluxo é público (ex.: pareamento anónimo).

### Fluxo de pareamento (hoje)

1. O player abre a rota pública **`/pareamento`** (WebView Android TV ou browser).
2. **`createPairingCode`** insere uma linha em **`pairing_codes`** (código + `expires_at`), sem `organization_id`.
3. O admin autenticado abre **Telas › Adicionar tela**, informa o código e dados; **`claimPairingCode`** valida JWT, perfil (`admin_master` | `gestor`), consome o código e **cria `screens`** na organização, gravando `pairing_code` na própria screen e marcando o código como usado.
4. O player faz polling em **`checkPairingStatus`** até `paired: true`.

### Modelo de dados relevante (já existente)

- **`screens`:** unidade lógica do player (nome, `organization_id`, `unit_id`, `pairing_code`, `orientation`, `is_online`, `device_status`, `last_seen_at`, `last_sync_at`, `platform`, `player_version`, etc.). O tipo em `src/lib/db-types.ts` já prevê **`platform: string | null`**.
- **`pairing_codes`:** códigos temporários; ligação a `screen_id` e `organization_id` após uso.
- **Campanhas, playlists, mídias:** tabelas `campaigns`, `playlists`, `media_assets`, etc., consumidas pelo painel via hooks Supabase.

### Player Web atual (`/player`)

- Rota de **demonstração** ligada a `useMedia()` / `useCampaigns()` com cliente Supabase **sessão utilizador** — não é o protocolo completo de signage por `screen_id` documentado no pedido; o produto Android em produção pode estar noutro URL ou evolução futura. Qualquer evolução multi-plataforma deve **preservar** URLs e funções usadas pelo Android atual (`/pareamento`, `claimPairingCode`, `checkPairingStatus`, `createPairingCode`).

---

## 2. O que já serve para multi-plataforma

- **Um painel, um banco, um projeto Supabase** — já é o modelo.
- **Tabela `screens` com campo `platform`** (no tipo TS; confirmar coluna no Postgres em cada ambiente).
- **Separação parcial de “player público” vs “admin autenticado”** via server functions.

---

## 3. O que está acoplado a “Android” ou a Web genérica

- **`capacitor.config.ts`:** empacotamento Android TV (User-Agent, `webDir`, URL remota).
- **`/pareamento`:** não enviava plataforma explícita ao gerar código — impossível distinguir pedido Tizen vs Android no histórico de `pairing_codes`.
- **Ausência (no repositório) de rotas dedicadas** estilo `POST /devices/heartbeat` REST clássico: o padrão atual é **server functions TanStack**, não OpenAPI separada. Para compatibilidade, novos fluxos devem **adicionar** funções, não substituir as existentes.

---

## 4. Adaptações mínimas necessárias (incrementais)

| # | Mudança | Motivo | Risco regressão |
|---|---------|--------|------------------|
| 1 | Coluna `pairing_codes.player_platform` + gravação em `createPairingCode` | Saber qual player pediu o código | Baixo: coluna nullable |
| 2 | `claimPairingCode` aceitar `platform` (default `android`) e persistir em `screens.platform` | Painel escolhe / confirma plataforma | Baixo: default preserva Android |
| 3 | Tabelas `screen_logs`, `screen_heartbeats`, `screen_sync_history` | Logs / heartbeat por screen + plataforma | Baixo: tabelas novas |
| 4 | `postPlayerHeartbeat` / `postPlayerLog` (server functions) | Telemetria sem expor service key ao cliente | Médio: validar bem `screen_id` + `pairing_code` |
| 5 | `src/lib/platform-capabilities.ts` | Evitar `if` espalhado | Baixo |
| 6 | Painel: filtro + select plataforma + badges | UX multi-plataforma | Baixo |
| 7 | Pasta `players/tizen-web/` | Base isolada Tizen (Web) | Nenhum no Android |

**Nota de nomenclatura:** o domínio do produto usa **`screens`**, não `devices`. As tabelas novas usam prefixo **`screen_`** e FK `screen_id` para não duplicar conceitos nem quebrar FKs existentes.

---

## 5. Riscos de regressão

- **Migrations em produção:** executar SQL em janela controlada; colunas só `ADD` com default/backfill seguro.
- **Heartbeat público:** sem rate limit na v1 pode ser abusado — mitigar depois (IP limit, Cloudflare, ou `device_token` por screen).
- **Player `/player` demo** vs player real: não misturar; mudanças focadas em `screens.functions`, `player.functions`, painel e pasta Tizen.

---

## 6. Plano de implementação seguro (etapas)

1. **Mapeamento** — este documento + inventário de rotas server (`screens.functions`, futuros `player.functions`).
2. **Banco** — migration idempotente (`supabase/migrations/…`).
3. **Backend server functions** — estender pairing; adicionar heartbeat/log (sem alterar assinaturas antigas obrigatórias: `claimPairingCode` continua a aceitar payload sem `platform`).
4. **Painel** — plataforma no modal de pareamento; filtro na lista.
5. **Android** — apenas `?platform=android` opcional em `/pareamento` (comportamento idêntico se omitido).
6. **Tizen** — consumir mesmas URLs + `?platform=tizen`; empacotar WGT no Tizen Studio (documentado no README da pasta).
7. **Testes** — checklist secção 11.
8. **Evolução** — tokens por screen, sync incremental, Edge Functions se necessário.

---

## 7. Endpoints / funções servidor

### Mantidas (compatibilidade)

| Função | Uso |
|--------|-----|
| `createPairingCode` | Player anónimo gera código (agora aceita `{ platform? }`) |
| `checkPairingStatus` | Player polling |
| `claimPairingCode` | Admin vincula código (agora aceita `{ platform? }`) |

### Novas (aditivas)

| Função | Descrição |
|--------|-----------|
| `postPlayerHeartbeat` | Atualiza `screens` + insere `screen_heartbeats` (auth leve: `screen_id` + `pairing_code`) |
| `postPlayerLog` | Insere `screen_logs` |
| `postPlayerSyncHistory` *(opcional próxima iteração)* | Histórico de sync |

REST clássico `POST /devices/...` **não substitui** as server functions; se no futuro expuser API HTTP, manter proxies que chamem a mesma lógica.

---

## 8. Compatibilidade retroativa

- **`claimPairingCode`:** `platform` opcional; se ausente → **`android`**.
- **`createPairingCode`:** sem body ou sem `platform` → **`android`**.
- **Colunas novas:** `NULL` permitido onde aplicável.
- **Android Capacitor:** nenhuma alteração obrigatória na WebView; URL pode continuar igual.

---

## 9. Checklist de testes (manual)

### Android / Web player (regressão)

- [ ] `/pareamento` gera código.
- [ ] Admin pareia com código válido.
- [ ] Lista “Telas” mostra a nova tela; plataforma **android** quando default.
- [ ] Código expirado / usado continua a falhar com mensagens esperadas.

### Tizen (base Web)

- [ ] Abrir `/pareamento?platform=tizen` grava `player_platform=tizen` no código (ver SQL).
- [ ] Admin escolhe **Tizen** no modal e pareia; `screens.platform = tizen`.

### Backend

- [ ] Nenhum erro de TypeScript / lint nos ficheiros tocados.
- [ ] Migration aplicada no projeto Supabase de staging antes de produção.

---

## 10. Próximos passos recomendados

1. Substituir autenticação “código de pareamento como segredo” por **`player_token`** rotacionável por `screen_id`.
2. **Rate limiting** nas funções públicas.
3. **WGT Tizen** com `config.xml`, ícones, privilégios `http://tizen.org/privilege/internet`.
4. **Relatórios:** filtro `platform` em `app.relatorios.tsx` (quando agregações existirem).
5. **Sincronização de playlist por screen** alinhada com RLS ou RPC `security definer`.

---

## 11. Ficheiros alterados / criados (esta fase)

| Ficheiro | Motivo |
|----------|--------|
| `docs/MULTI_PLATFORM_ARCHITECTURE.md` | Diagnóstico, plano, compatibilidade, checklist |
| `supabase/migrations/20260418143000_multi_platform.sql` | `player_platform`, `store_type`, tabelas `screen_*`, RLS |
| `src/lib/platform-capabilities.ts` | Resolver de capabilities por plataforma |
| `src/lib/server/player.functions.ts` | `postPlayerHeartbeat`, `postPlayerLog` |
| `src/lib/server/screens.functions.ts` | `platform` no claim/create pairing |
| `src/lib/db-types.ts` | `store_type`, `player_platform` opcionais |
| `src/routes/app.telas.tsx` | Filtro, badge, select plataforma no pareamento |
| `src/routes/pareamento.tsx` | `?platform=tizen` \| `android` + envio ao servidor |
| `src/routes/__root.tsx` | Import side-effect para registar RPC do player |
| `players/tizen-web/*` | Base estática + README (sem acoplamento ao build Vite) |

## 12. Resumo executivo (entrega pedida)

1. **Diagnóstico** — Secções 1–6 deste documento.  
2. **Plano sem regressão** — Defaults `android`, colunas opcionais, tabelas novas.  
3. **Ficheiros** — Tabela na secção 11.  
4. **Backend** — Funções servidor estendidas + novas em `player.functions.ts`.  
5. **Modelagem** — SQL em `supabase/migrations/` (prefixo `screen_`, FK `screen_id`).  
6. **Android** — Sem mudança obrigatória; URL pode acrescentar `?platform=android` opcionalmente.  
7. **Tizen** — Pasta `players/tizen-web/` + instrução de usar `/pareamento?platform=tizen` no mesmo host.  
8. **Painel** — Filtro + campo plataforma + badges em Telas.  
9. **Logs / heartbeat** — `postPlayerLog`, `postPlayerHeartbeat` + tabelas (após migration).  
10. **Compatibilidade** — Payloads antigos sem `platform` tratados como Android.  
11. **Testes** — Checklist secção 9 (manual).  
12. **Documentação** — Este ficheiro.

**Migrations:** aplicar manualmente no Supabase. **Endpoints REST** clássicos não foram criados; o modelo continua a ser **TanStack `createServerFn`** (adição, não substituição).

**Pendências sugeridas:** `postPlayerSyncHistory`, filtros em Relatórios, token por `screen` em vez de `pairing_code`, empacotar WGT no Tizen Studio, rate limit nas funções públicas.

---

## 12. Migrations executadas

As migrations **não são executadas automaticamente** pelo repositório: devem ser aplicadas no Supabase (SQL Editor ou CLI) no ambiente correspondente. O ficheiro em `supabase/migrations/` documenta o DDL exacto.

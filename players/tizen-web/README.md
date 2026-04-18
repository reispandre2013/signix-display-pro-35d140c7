# Signix Player — Tizen TV (Web)

Base isolada para empacotar um **Samsung Tizen Web App** que partilha o mesmo backend Supabase + as mesmas **server functions** do monorepo (`createPairingCode`, `checkPairingStatus`, `postPlayerHeartbeat`, etc.).

## Fluxo recomendado

1. Aloje esta pasta num servidor estático **ou** aponte o `config.xml` do Tizen Studio para o URL de produção do Signix (mesmo host do painel/player web).
2. Na TV, abra o fluxo de pareamento com query string **`?platform=tizen`**, por exemplo:  
   `https://SEU_DOMINIO/pareamento?platform=tizen`
3. No painel **Telas › Adicionar tela**, escolha **Samsung Tizen TV** e use o mesmo código exibido na TV.
4. Após o pareamento, abra o player com sync de playlist (usa `localStorage` gravado no passo 2):  
   `https://SEU_DOMINIO/player-screen?platform=tizen`  
   Esta rota chama **`getScreenPlaylistPayload`** (playlist real + fallback), **`postPlayerSyncAck`** e **`postPlayerHeartbeat`** com `screen_id` + `pairing_code`.
5. Opcional: num player WGT nativo, replique o mesmo protocolo via `fetch` ao endpoint RPC do TanStack Start (inspecione a rede no browser na rota acima).

## Empacotamento WGT

1. Instale **Tizen Studio** + extensão **TV**.
2. Crie projeto **Tizen Web Project (TV)** e copie `index.html`, `css/`, `js/` desta pasta.
3. Ajuste `config.xml`: privilégio `http://tizen.org/privilege/internet`, `content src` = URL ou ficheiro local.
4. Assine com certificado de autor e instale na TV.

## Variáveis

- `window.SIGNIX_API_BASE` — definir antes de `player.js` (ex.: origem do site em produção).

## Compatibilidade

Este diretório **não** altera o build Android/Capacitor. Evoluções de protocolo devem manter `?platform=tizen` e o campo `platform` no painel alinhados com o backend.

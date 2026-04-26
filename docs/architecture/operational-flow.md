# Fluxograma Operacional

Integração com deploy (Lovable) e com camada SaaS: ver [lovable-saas-and-signage-integration.md](./lovable-saas-and-signage-integration.md).

```mermaid
flowchart TD
    A[Usuário autentica no painel] --> B[Seleciona empresa/unidade]
    B --> C[Cria ou edita telas e grupos]
    C --> D[Gera código de pareamento]
    D --> E[Player envia pair-screen]
    E --> F[Tela vinculada + fingerprint]
    F --> G[Player envia heartbeat periódico]
    G --> H[Atualiza online/offline e alertas]
    H --> I[Gestor publica campanha]
    I --> J[resolve-screen-playlist]
    J --> K[Player recebe payload ativo]
    K --> L[Player reproduz mídia]
    L --> M[generate-proof-of-play]
    M --> N[playback_logs e prova hash]
    N --> O[Dashboard e relatórios]
    O --> P[export-report]
    H --> Q[daily-health-check]
    Q --> R[marca offline + limpeza órfãos]
```

## Regras centrais no fluxo

- Isolamento por `organization_id` em todo recurso sensível.
- RLS para impedir leitura cruzada entre empresas.
- Priorização de campanha por período + alvo + prioridade + agenda.
- Logs de auditoria automáticos para entidades críticas.

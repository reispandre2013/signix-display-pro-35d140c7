# Storage e RLS

## Buckets provisionados

- `logos` (público para assets institucionais)
- `media-images`
- `media-videos`
- `thumbnails`
- `temp-imports`

## Restrições aplicadas

- Limites de tamanho por bucket.
- Whitelist de MIME por bucket.
- Policies de `storage.objects` por `organization_id`.
- Escrita para `operador+`, exclusão para `gestor+`.

## Isolamento multiempresa

- Funções auxiliares:
  - `current_profile()`
  - `current_organization_id()`
  - `current_role()`
  - `is_org_member(org_id)`
  - `has_role(min_role)`
- Todas as tabelas sensíveis com `enable row level security`.
- Policies sempre filtrando por organização e perfil.

## Auditoria

- Trigger de auditoria em:
  - `screens`
  - `media_assets`
  - `playlists`
  - `campaigns`
- Eventos gravados em `audit_logs`.

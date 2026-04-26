# Dicionário de Dados - Supabase

## Tabelas de domínio

### `organizations`

Cadastro de empresas locatárias.
Campos-chave: `id`, `name`, `slug`, `cnpj`, `timezone`, `status`, timestamps.

### `profiles`

Perfil de usuário por organização.
Campos-chave: `auth_user_id`, `organization_id`, `role`, `unit_id`, `status`.

### `units`

Unidades físicas da organização.
Campos-chave: `organization_id`, `name`, `manager_name`, `status`.

### `screen_groups`

Agrupamento lógico de telas.
Campos-chave: `organization_id`, `name`, `status`.

### `screens`

Dispositivos/player endpoints.
Campos-chave: `organization_id`, `unit_id`, `pairing_code`, `device_fingerprint`, `is_online`, `device_status`, `last_seen_at`, `last_sync_at`.

### `screen_group_items`

Relação N:N entre grupos e telas.
Campos-chave: `group_id`, `screen_id`.

### `media_assets`

Arquivos de mídia publicados.
Campos-chave: `organization_id`, `file_path`, `mime_type`, `duration_seconds`, `valid_from`, `valid_until`, `status`.

### `playlists`

Sequências de mídia.
Campos-chave: `organization_id`, `name`, `status`, `created_by`.

### `playlist_items`

Itens ordenados de playlist.
Campos-chave: `playlist_id`, `media_asset_id`, `position`, `duration_override_seconds`.

### `campaigns`

Campanhas vinculadas a playlist.
Campos-chave: `organization_id`, `playlist_id`, `priority`, `start_at`, `end_at`, `status`.

### `campaign_schedules`

Faixas horárias por campanha.
Campos-chave: `campaign_id`, `day_of_week`, `start_time`, `end_time`, `timezone`, `is_active`.

### `campaign_targets`

Escopo de distribuição.
Campos-chave: `campaign_id`, `target_type(screen|unit|group)`, `target_id`.

### `device_heartbeats`

Telemetria periódica dos players.
Campos-chave: `organization_id`, `screen_id`, `sent_at`, `is_ok`, `device_info`.

### `sync_logs`

Histórico de sincronizações.
Campos-chave: `organization_id`, `screen_id`, `payload_version`, `sync_status`.

### `playback_logs`

Prova de exibição.
Campos-chave: `organization_id`, `screen_id`, `campaign_id`, `media_asset_id`, `played_at`, `duration_played`, `proof_hash`, `local_event_id`.

### `alerts`

Alertas operacionais.
Campos-chave: `organization_id`, `screen_id`, `alert_type`, `severity`, `status`, `resolved_at`.

### `audit_logs`

Trilha de auditoria imutável de ações críticas.
Campos-chave: `organization_id`, `actor_profile_id`, `entity_type`, `entity_id`, `action`, `old_data`, `new_data`.

### `app_settings`

Configurações por organização.
Campos-chave: `organization_id`, `key`, `value`.

## Índices estratégicos

- Campanhas por janela de tempo e prioridade.
- Telas por online/offline e último heartbeat.
- Playback por tela e data.
- Alertas e auditoria por organização e data.
- Códigos de pareamento com expiração.

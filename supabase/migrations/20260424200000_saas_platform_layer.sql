-- ============================================================================
-- Signix — Camada SaaS: roles, tabelas de billing, permissões, RLS, helpers
-- Idempotente / seguro em deploy incremental. Não remove tabelas existentes.
-- ============================================================================
-- (enum super_admin: migration 20260424120000_app_role_add_super_admin.sql)

-- 2) Pesos de papel (>= inclui tudo abaixo em has_role; super_admin inclui tudo)
create or replace function public.role_weight(role_name public.app_role)
returns int
language sql
immutable
as $$
  select case role_name
    when 'super_admin' then 1000
    when 'admin_master' then 100
    when 'gestor' then 70
    when 'operador' then 40
    else 10
  end;
$$;

-- 3) Plataforma: bypass RLS lógico via policies
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.role = 'super_admin' from public.profiles p where p.auth_user_id = auth.uid() limit 1),
    false
  );
$$;

-- 4) Colunas de compatibilidade em organizations
alter table public.organizations add column if not exists owner_profile_id uuid references public.profiles(id) on delete set null;
create index if not exists idx_organizations_owner on public.organizations(owner_profile_id);

-- 5) Colunas em profiles
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists last_login_at timestamptz;
alter table public.profiles add column if not exists created_by_profile_id uuid references public.profiles(id) on delete set null;
create index if not exists idx_profiles_created_by on public.profiles(created_by_profile_id);

-- 6) Tabela global de definições SaaS (plataforma, uma linha / chave)
create table if not exists public.saas_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 7) permissions + role_permissions + user_permissions (overrides)
create table if not exists public.permission_catalog (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  module text
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role public.app_role not null,
  permission_key text not null references public.permission_catalog(key) on delete cascade,
  allowed boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  unique (role, permission_key)
);

create table if not exists public.user_permissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  permission_key text not null references public.permission_catalog(key) on delete cascade,
  allowed boolean not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, permission_key)
);
create index if not exists user_permissions_profile_idx on public.user_permissions(profile_id);
create index if not exists user_permissions_org_idx on public.user_permissions(organization_id);

-- 8) planos, assinaturas, faturas, licenças, pagamentos, checkout, contadores
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slug text not null,
  name text not null,
  description text,
  price_monthly_cents integer not null default 0,
  price_yearly_cents integer not null default 0,
  currency text not null default 'BRL',
  max_screens integer not null default 1,
  max_users integer not null default 1,
  max_storage_mb bigint not null default 5120,
  max_playlists integer not null default 10,
  max_campaigns integer not null default 10,
  max_storage_gb integer not null default 5,
  features jsonb not null default '[]'::jsonb,
  support_level text default 'standard',
  is_recommended boolean default false,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists plans_active_idx on public.plans(is_active, sort_order);
create index if not exists plans_slug_idx on public.plans(slug);

-- Compatibilidade: plano pré-existente (ex.: ficheiro legacy) sem colunas novas
alter table public.plans add column if not exists slug text;
alter table public.plans add column if not exists max_playlists integer;
alter table public.plans add column if not exists max_campaigns integer;
alter table public.plans add column if not exists max_storage_mb bigint;
update public.plans set slug = coalesce(nullif(btrim(slug), ''), code) where slug is null or btrim(slug) = '';

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null default 'trialing',
  billing_cycle text not null default 'monthly',
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  amount_cents integer not null default 0,
  currency text not null default 'BRL',
  cancel_at_period_end boolean not null default false,
  payment_provider text,
  external_provider text,
  external_id text,
  external_subscription_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint subscriptions_status_check check (status in ('trialing','active','past_due','canceled','expired','suspended','pending')),
  constraint subscriptions_cycle_check check (billing_cycle in ('monthly','yearly'))
);
create index if not exists subscriptions_org_idx on public.subscriptions(organization_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);
alter table public.subscriptions add column if not exists cancel_at timestamptz;
alter table public.subscriptions add column if not exists external_subscription_id text;
alter table public.subscriptions add column if not exists external_provider text;
alter table public.subscriptions add column if not exists payment_provider text;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  number text unique,
  amount_cents integer not null default 0,
  currency text not null default 'BRL',
  status text not null default 'open',
  due_date timestamptz,
  paid_at timestamptz,
  issued_at timestamptz not null default timezone('utc', now()),
  payment_method text,
  payment_provider text,
  external_provider text,
  external_id text,
  pdf_url text,
  invoice_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint invoices_status_check check (status in ('draft','open','paid','overdue','void','refunded'))
);
create index if not exists invoices_org_idx on public.invoices(organization_id);
create index if not exists invoices_status_idx on public.invoices(status);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  amount_cents integer not null default 0,
  status text not null default 'pending',
  method text,
  payment_provider text,
  external_payment_id text,
  paid_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists payments_org_idx on public.payments(organization_id);
create index if not exists payments_ext_idx on public.payments(payment_provider, external_payment_id);

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  plan_id uuid references public.plans(id) on delete set null,
  license_key text not null default replace(gen_random_uuid()::text, '-', '') unique,
  key text,
  status text not null default 'active',
  activated_at timestamptz,
  valid_from timestamptz not null default timezone('utc', now()),
  valid_until timestamptz,
  expires_at timestamptz,
  max_screens integer not null default 1,
  max_users integer not null default 1,
  max_storage_mb bigint not null default 5120,
  max_playlists integer,
  max_campaigns integer,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint licenses_status_check check (status in ('trial','active','expired','suspended','canceled'))
);
create index if not exists licenses_org_idx on public.licenses(organization_id);

-- Espelha key em license_key se necessário
update public.licenses set key = license_key where key is null and license_key is not null;
update public.licenses set license_key = key where license_key is null and key is not null;

create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete restrict,
  organization_id uuid references public.organizations(id) on delete set null,
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  company_name text,
  company_document text,
  status text not null default 'pending',
  payment_provider text,
  external_checkout_id text,
  checkout_url text,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists checkout_sessions_plan_idx on public.checkout_sessions(plan_id);
create index if not exists checkout_sessions_status_idx on public.checkout_sessions(status);

create table if not exists public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  total_screens integer not null default 0,
  total_users integer not null default 0,
  storage_used_mb numeric(14,2) not null default 0,
  total_playlists integer not null default 0,
  total_campaigns integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

-- 9) Atualizar updated_at
create or replace function public.tg_set_updated_at_row()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- 10) Contadores
create or replace function public.refresh_usage_counters(p_org uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  c_screens int;
  c_users int;
  c_playlists int;
  c_campaigns int;
  c_storage numeric;
  my_org uuid;
begin
  if auth.uid() is not null then
    my_org := (select p.organization_id from public.profiles p where p.auth_user_id = auth.uid() limit 1);
    if not public.is_platform_admin() and p_org is distinct from my_org then
      raise exception 'Acesso negado: usage_counters noutra organização.';
    end if;
  end if;

  select count(*) into c_screens from public.screens where organization_id = p_org;
  select count(*) into c_users from public.profiles where organization_id = p_org and status = 'active';
  select count(*) into c_playlists from public.playlists where organization_id = p_org;
  select count(*) into c_campaigns from public.campaigns where organization_id = p_org;
  select coalesce(sum( (coalesce(file_size,0))::numeric / 1048576.0), 0) into c_storage
    from public.media_assets where organization_id = p_org;

  insert into public.usage_counters (organization_id, total_screens, total_users, storage_used_mb, total_playlists, total_campaigns, updated_at)
  values (p_org, c_screens, c_users, c_storage, c_playlists, c_campaigns, timezone('utc', now()))
  on conflict (organization_id) do update set
    total_screens = excluded.total_screens,
    total_users = excluded.total_users,
    storage_used_mb = excluded.storage_used_mb,
    total_playlists = excluded.total_playlists,
    total_campaigns = excluded.total_campaigns,
    updated_at = excluded.updated_at;
end;
$$;

-- 11) Contexto (RPC para Edge / app)
create or replace function public.get_user_saas_context()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  p public.profiles%rowtype;
  pl public.plans%rowtype;
  sub public.subscriptions%rowtype;
  lic public.licenses%rowtype;
  u public.usage_counters%rowtype;
  org public.organizations%rowtype;
  result jsonb;
begin
  if auth.uid() is null then
    return jsonb_build_object('error', 'not_authenticated');
  end if;

  select * into p from public.profiles where auth_user_id = auth.uid() limit 1;
  if p.id is null then
    return jsonb_build_object('error', 'no_profile');
  end if;

  if p.role = 'super_admin' then
    return jsonb_build_object(
      'profile_id', p.id,
      'auth_user_id', p.auth_user_id,
      'organization_id', p.organization_id,
      'role', p.role,
      'is_platform_admin', true
    );
  end if;

  select * into org from public.organizations where id = p.organization_id;
  select * into sub
    from public.subscriptions
    where organization_id = p.organization_id
    order by created_at desc
    limit 1;
  if sub.id is not null then
    select * into pl from public.plans where id = sub.plan_id;
  else
    pl := null;
  end if;
  select * into lic
    from public.licenses
    where organization_id = p.organization_id
    order by valid_from desc
    limit 1;
  select * into u from public.usage_counters where organization_id = p.organization_id;
  if u.id is null then
    perform public.refresh_usage_counters(p.organization_id);
    select * into u from public.usage_counters where organization_id = p.organization_id;
  end if;

  result := jsonb_build_object(
    'profile_id', p.id,
    'auth_user_id', p.auth_user_id,
    'organization_id', p.organization_id,
    'role', p.role,
    'is_platform_admin', false,
    'organization', to_jsonb(org),
    'subscription', to_jsonb(sub),
    'plan', to_jsonb(pl),
    'license', to_jsonb(lic),
    'usage', to_jsonb(u)
  );
  return result;
end;
$$;

grant execute on function public.get_user_saas_context() to authenticated;
grant execute on function public.refresh_usage_counters(uuid) to authenticated, service_role;

-- 12) Validação de limites
create or replace function public.check_plan_limit(p_org uuid, p_kind text, p_by integer default 1)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  u public.usage_counters%rowtype;
  lim_val bigint;
  cur_val numeric;
  block boolean := false;
  orgst public.record_status;
  lic_screens int;
  lic_users int;
  lic_playlists int;
  lic_campaigns int;
  lic_storage_mb bigint;
  pl_screens int;
  pl_users int;
  pl_playlists int;
  pl_campaigns int;
  pl_storage_mb bigint;
  pl_storage_gb int;
begin
  select status into orgst from public.organizations where id = p_org;
  if orgst = 'suspended' then
    raise exception 'Organização suspensa. Contacte o suporte.';
  end if;

  if auth.uid() is not null then
    if not public.is_platform_admin() and p_org is distinct from (select p.organization_id from public.profiles p where p.auth_user_id = auth.uid() limit 1) then
      raise exception 'Acesso negado: limites noutra organização.';
    end if;
  end if;

  select l.max_screens, l.max_users, l.max_playlists, l.max_campaigns, l.max_storage_mb
  into lic_screens, lic_users, lic_playlists, lic_campaigns, lic_storage_mb
  from public.licenses l
  where l.organization_id = p_org and l.status in ('trial','active')
  order by l.valid_from desc
  limit 1;

  select p.max_screens, p.max_users, p.max_playlists, p.max_campaigns, p.max_storage_mb, p.max_storage_gb
  into pl_screens, pl_users, pl_playlists, pl_campaigns, pl_storage_mb, pl_storage_gb
  from public.plans p
  join public.subscriptions s on s.plan_id = p.id
  where s.organization_id = p_org and s.status in ('active','trialing')
  order by s.created_at desc
  limit 1;

  perform public.refresh_usage_counters(p_org);
  select * into u from public.usage_counters where organization_id = p_org;

  if p_kind = 'screen' then
    lim_val := coalesce(nullif(lic_screens, 0), nullif(pl_screens, 0), 999999);
    cur_val := u.total_screens;
    if cur_val + p_by > lim_val then block := true; end if;
  elsif p_kind = 'user' then
    lim_val := coalesce(nullif(lic_users, 0), nullif(pl_users, 0), 999999);
    cur_val := u.total_users;
    if cur_val + p_by > lim_val then block := true; end if;
  elsif p_kind = 'playlist' then
    lim_val := coalesce(lic_playlists, pl_playlists, 999999);
    cur_val := u.total_playlists;
    if cur_val + p_by > lim_val then block := true; end if;
  elsif p_kind = 'campaign' then
    lim_val := coalesce(lic_campaigns, pl_campaigns, 999999);
    cur_val := u.total_campaigns;
    if cur_val + p_by > lim_val then block := true; end if;
  elsif p_kind = 'storage_mb' then
    lim_val := coalesce(lic_storage_mb, pl_storage_mb, (pl_storage_gb::bigint) * 1000, 999999999);
    if u.storage_used_mb + p_by > lim_val then block := true; end if;
  else
    return;
  end if;

  if block then
    raise exception 'Limite do plano excedido para: % (verifique a assinatura).', p_kind;
  end if;
end;
$$;

grant execute on function public.check_plan_limit(uuid, text, integer) to authenticated, service_role;

-- 13) RLS: tabelas SaaS
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.licenses enable row level security;
alter table public.checkout_sessions enable row level security;
alter table public.usage_counters enable row level security;
alter table public.saas_settings enable row level security;
alter table public.permission_catalog enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_permissions enable row level security;

-- Plans: leitura pública (ativos) + super_admin total
drop policy if exists "plans_read_active" on public.plans;
create policy "plans_read_active" on public.plans for select to authenticated
  using (is_active = true or public.is_platform_admin());
drop policy if exists "plans_super_insert" on public.plans;
create policy "plans_super_insert" on public.plans for insert to authenticated
  with check (public.is_platform_admin());
drop policy if exists "plans_super_update" on public.plans;
create policy "plans_super_update" on public.plans for update to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());
drop policy if exists "plans_super_delete" on public.plans;
create policy "plans_super_delete" on public.plans for delete to authenticated
  using (public.is_platform_admin());

-- Leitura na org + super; mutação apenas super admin (webhooks/Edge usam service role)
drop policy if exists "subscriptions_org" on public.subscriptions;
drop policy if exists "subscriptions_select" on public.subscriptions;
drop policy if exists "subscriptions_mutation_super" on public.subscriptions;
create policy "subscriptions_select" on public.subscriptions for select to authenticated
  using (
    organization_id = (select p.organization_id from public.profiles p where p.auth_user_id = auth.uid())
    or public.is_platform_admin()
  );
create policy "subscriptions_mutation_super" on public.subscriptions for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "invoices_org" on public.invoices;
drop policy if exists "invoices_select" on public.invoices;
drop policy if exists "invoices_mutation_super" on public.invoices;
create policy "invoices_select" on public.invoices for select to authenticated
  using (
    organization_id = (select p.organization_id from public.profiles p where p.auth_user_id = auth.uid())
    or public.is_platform_admin()
  );
create policy "invoices_mutation_super" on public.invoices for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "payments_org" on public.payments;
drop policy if exists "payments_select" on public.payments;
drop policy if exists "payments_mutation_super" on public.payments;
create policy "payments_select" on public.payments for select to authenticated
  using (
    organization_id = (select p.organization_id from public.profiles p where p.auth_user_id = auth.uid())
    or public.is_platform_admin()
  );
create policy "payments_mutation_super" on public.payments for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "licenses_org" on public.licenses;
drop policy if exists "licenses_select" on public.licenses;
drop policy if exists "licenses_mutation_super" on public.licenses;
create policy "licenses_select" on public.licenses for select to authenticated
  using (
    organization_id = (select p.organization_id from public.profiles p where p.auth_user_id = auth.uid())
    or public.is_platform_admin()
  );
create policy "licenses_mutation_super" on public.licenses for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "usage_org" on public.usage_counters;
drop policy if exists "usage_select" on public.usage_counters;
create policy "usage_select" on public.usage_counters for select to authenticated
  using (
    organization_id = (select p.organization_id from public.profiles p where p.auth_user_id = auth.uid())
    or public.is_platform_admin()
  );

-- Checkout: criação anónima/convite — apenas service role e super_admin; clientes: select próprio
drop policy if exists "checkout_super" on public.checkout_sessions;
create policy "checkout_super" on public.checkout_sessions for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- Saas settings: só super
drop policy if exists "saas_settings_super" on public.saas_settings;
create policy "saas_settings_super" on public.saas_settings for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- permission_catalog: leitura autenticada, escrita super
drop policy if exists "perm_cat_read" on public.permission_catalog;
create policy "perm_cat_read" on public.permission_catalog for select to authenticated using (true);
drop policy if exists "perm_cat_write" on public.permission_catalog;
create policy "perm_cat_write" on public.permission_catalog for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- role_permissions: leitura a todos, escrita super
drop policy if exists "role_perm_read" on public.role_permissions;
create policy "role_perm_read" on public.role_permissions for select to authenticated using (true);
drop policy if exists "role_perm_write" on public.role_permissions;
create policy "role_perm_write" on public.role_permissions for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- user_permissions: master/gestor na org, super, ou o próprio perfil (leitura)
drop policy if exists "user_perm_select" on public.user_permissions;
create policy "user_perm_select" on public.user_permissions for select to authenticated
  using (
    public.is_platform_admin()
    or organization_id = (select p.organization_id from public.profiles p where p.auth_user_id = auth.uid())
    or profile_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid())
  );
drop policy if exists "user_perm_manage" on public.user_permissions;
create policy "user_perm_manage" on public.user_permissions for all to authenticated
  using (
    public.is_platform_admin()
    or (organization_id = (select p.organization_id from public.profiles p where p.auth_user_id = auth.uid())
        and (public.has_role('admin_master') or public.has_role('gestor')))
  )
  with check (
    public.is_platform_admin()
    or (organization_id = (select p.organization_id from public.profiles p where p.auth_user_id = auth.uid())
        and (public.has_role('admin_master') or public.has_role('gestor')))
  );

-- 14) Ajuste RLS existente: super_admin acesso global
-- organizations
drop policy if exists "organizations_select_member" on public.organizations;
create policy "organizations_select_member" on public.organizations for select
  using (public.is_org_member(id) or public.is_platform_admin());

create policy "organizations_update_members" on public.organizations for update
  using (
    (public.is_org_member(id) and (public.has_role('admin_master') or public.has_role('gestor')))
    or public.is_platform_admin()
  )
  with check (
    (public.is_org_member(id) and (public.has_role('admin_master') or public.has_role('gestor')))
    or public.is_platform_admin()
  );

create policy "organizations_insert_platform" on public.organizations for insert
  with check (public.is_platform_admin());

-- profiles
drop policy if exists "profiles_select_same_org" on public.profiles;
create policy "profiles_select_same_org" on public.profiles for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

drop policy if exists "profiles_insert_admin_master" on public.profiles;
create policy "profiles_insert_admin_master" on public.profiles for insert
  with check (
    (public.has_role('admin_master') and public.is_org_member(organization_id))
    or public.is_platform_admin()
  );

drop policy if exists "profiles_update_admin_or_self" on public.profiles;
create policy "profiles_update_admin_or_self" on public.profiles for update
  using (public.is_org_member(organization_id) or public.is_platform_admin())
  with check (
    (public.is_org_member(organization_id) and (public.has_role('admin_master') or auth_user_id = auth.uid()))
    or public.is_platform_admin()
  );

drop policy if exists "profiles_delete_admin_master" on public.profiles;
create policy "profiles_delete_admin_master" on public.profiles for delete
  using (
    (public.has_role('admin_master') and public.is_org_member(organization_id))
    or public.is_platform_admin()
  );

-- units
drop policy if exists "units_select_same_org" on public.units;
create policy "units_select_same_org" on public.units for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());
drop policy if exists "units_write_gestor_plus" on public.units;
create policy "units_write_gestor_plus" on public.units for all
  using ((public.is_org_member(organization_id) and public.has_role('gestor')) or public.is_platform_admin())
  with check ((public.is_org_member(organization_id) and public.has_role('gestor')) or public.is_platform_admin());

-- demais: adiciona OR is_platform_admin() a using/with check
drop policy if exists "screen_groups_select_same_org" on public.screen_groups;
create policy "screen_groups_select_same_org" on public.screen_groups for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());
drop policy if exists "screen_groups_write_operador_plus" on public.screen_groups;
create policy "screen_groups_write_operador_plus" on public.screen_groups for all
  using ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin())
  with check ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin());

drop policy if exists "screens_select_same_org" on public.screens;
create policy "screens_select_same_org" on public.screens for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());
drop policy if exists "screens_write_operador_plus" on public.screens;
create policy "screens_write_operador_plus" on public.screens for all
  using ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin())
  with check ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin());

drop policy if exists "screen_group_items_select_same_org" on public.screen_group_items;
create policy "screen_group_items_select_same_org" on public.screen_group_items for select
  using (
    exists (select 1 from public.screen_groups g where g.id = screen_group_items.group_id
      and (public.is_org_member(g.organization_id) or public.is_platform_admin()))
  );
drop policy if exists "screen_group_items_write_operador_plus" on public.screen_group_items;
create policy "screen_group_items_write_operador_plus" on public.screen_group_items for all
  using (
    exists (select 1 from public.screen_groups g where g.id = screen_group_items.group_id
      and ((public.is_org_member(g.organization_id) and public.has_role('operador')) or public.is_platform_admin()))
  )
  with check (
    exists (select 1 from public.screen_groups g where g.id = screen_group_items.group_id
      and ((public.is_org_member(g.organization_id) and public.has_role('operador')) or public.is_platform_admin()))
  );

drop policy if exists "media_assets_select_same_org" on public.media_assets;
create policy "media_assets_select_same_org" on public.media_assets for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());
drop policy if exists "media_assets_write_operador_plus" on public.media_assets;
create policy "media_assets_write_operador_plus" on public.media_assets for all
  using ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin())
  with check ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin());

drop policy if exists "playlists_select_same_org" on public.playlists;
create policy "playlists_select_same_org" on public.playlists for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());
drop policy if exists "playlists_write_operador_plus" on public.playlists;
create policy "playlists_write_operador_plus" on public.playlists for all
  using ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin())
  with check ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin());

drop policy if exists "playlist_items_select_same_org" on public.playlist_items;
create policy "playlist_items_select_same_org" on public.playlist_items for select
  using (
    exists (select 1 from public.playlists p where p.id = playlist_items.playlist_id
      and (public.is_org_member(p.organization_id) or public.is_platform_admin()))
  );
drop policy if exists "playlist_items_write_operador_plus" on public.playlist_items;
create policy "playlist_items_write_operador_plus" on public.playlist_items for all
  using (
    exists (select 1 from public.playlists p where p.id = playlist_items.playlist_id
      and ((public.is_org_member(p.organization_id) and public.has_role('operador')) or public.is_platform_admin()))
  )
  with check (
    exists (select 1 from public.playlists p where p.id = playlist_items.playlist_id
      and ((public.is_org_member(p.organization_id) and public.has_role('operador')) or public.is_platform_admin()))
  );

drop policy if exists "campaigns_select_same_org" on public.campaigns;
create policy "campaigns_select_same_org" on public.campaigns for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());
drop policy if exists "campaigns_write_operador_plus" on public.campaigns;
create policy "campaigns_write_operador_plus" on public.campaigns for all
  using ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin())
  with check ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin());

drop policy if exists "campaign_schedules_select_same_org" on public.campaign_schedules;
create policy "campaign_schedules_select_same_org" on public.campaign_schedules for select
  using (
    exists (select 1 from public.campaigns c where c.id = campaign_schedules.campaign_id
      and (public.is_org_member(c.organization_id) or public.is_platform_admin()))
  );
drop policy if exists "campaign_schedules_write_operador_plus" on public.campaign_schedules;
create policy "campaign_schedules_write_operador_plus" on public.campaign_schedules for all
  using (
    exists (select 1 from public.campaigns c where c.id = campaign_schedules.campaign_id
      and ((public.is_org_member(c.organization_id) and public.has_role('operador')) or public.is_platform_admin()))
  )
  with check (
    exists (select 1 from public.campaigns c where c.id = campaign_schedules.campaign_id
      and ((public.is_org_member(c.organization_id) and public.has_role('operador')) or public.is_platform_admin()))
  );

drop policy if exists "campaign_targets_select_same_org" on public.campaign_targets;
create policy "campaign_targets_select_same_org" on public.campaign_targets for select
  using (
    exists (select 1 from public.campaigns c where c.id = campaign_targets.campaign_id
      and (public.is_org_member(c.organization_id) or public.is_platform_admin()))
  );
drop policy if exists "campaign_targets_write_operador_plus" on public.campaign_targets;
create policy "campaign_targets_write_operador_plus" on public.campaign_targets for all
  using (
    exists (select 1 from public.campaigns c where c.id = campaign_targets.campaign_id
      and ((public.is_org_member(c.organization_id) and public.has_role('operador')) or public.is_platform_admin()))
  )
  with check (
    exists (select 1 from public.campaigns c where c.id = campaign_targets.campaign_id
      and ((public.is_org_member(c.organization_id) and public.has_role('operador')) or public.is_platform_admin()))
  );

drop policy if exists "device_heartbeats_select_same_org" on public.device_heartbeats;
create policy "device_heartbeats_select_same_org" on public.device_heartbeats for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());
drop policy if exists "device_heartbeats_insert_operador_plus" on public.device_heartbeats;
create policy "device_heartbeats_insert_operador_plus" on public.device_heartbeats for insert
  with check ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin());

drop policy if exists "sync_logs_select_same_org" on public.sync_logs;
create policy "sync_logs_select_same_org" on public.sync_logs for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());
drop policy if exists "sync_logs_insert_operador_plus" on public.sync_logs;
create policy "sync_logs_insert_operador_plus" on public.sync_logs for insert
  with check ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin());

drop policy if exists "playback_logs_select_same_org" on public.playback_logs;
create policy "playback_logs_select_same_org" on public.playback_logs for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());
drop policy if exists "playback_logs_insert_operador_plus" on public.playback_logs;
create policy "playback_logs_insert_operador_plus" on public.playback_logs for insert
  with check ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin());

drop policy if exists "alerts_select_same_org" on public.alerts;
create policy "alerts_select_same_org" on public.alerts for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());
drop policy if exists "alerts_write_operador_plus" on public.alerts;
create policy "alerts_write_operador_plus" on public.alerts for all
  using ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin())
  with check ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin());

drop policy if exists "audit_logs_select_same_org" on public.audit_logs;
create policy "audit_logs_select_same_org" on public.audit_logs for select
  using (
    (public.is_org_member(organization_id) and public.has_role('gestor')) or public.is_platform_admin()
  );

drop policy if exists "app_settings_select_same_org" on public.app_settings;
create policy "app_settings_select_same_org" on public.app_settings for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());
drop policy if exists "app_settings_write_gestor_plus" on public.app_settings;
create policy "app_settings_write_gestor_plus" on public.app_settings for all
  using ((public.is_org_member(organization_id) and public.has_role('gestor')) or public.is_platform_admin())
  with check ((public.is_org_member(organization_id) and public.has_role('gestor')) or public.is_platform_admin());

-- 15) Storage: super admin
drop policy if exists "storage_org_read" on storage.objects;
create policy "storage_org_read" on storage.objects for select
  using (
    bucket_id in ('logos','media-images','media-videos','thumbnails','temp-imports')
    and (
      public.is_platform_admin()
      or (bucket_id = 'logos')
      or public.is_org_member((coalesce((metadata->>'organization_id')::uuid, public.current_organization_id())))
    )
  );

drop policy if exists "storage_org_write_operador_plus" on storage.objects;
create policy "storage_org_write_operador_plus" on storage.objects for insert
  with check (
    bucket_id in ('logos','media-images','media-videos','thumbnails','temp-imports')
    and (public.is_platform_admin() or (
      public.has_role('operador')
      and public.is_org_member((coalesce((metadata->>'organization_id')::uuid, public.current_organization_id())))
    ))
  );

drop policy if exists "storage_org_update_operador_plus" on storage.objects;
create policy "storage_org_update_operador_plus" on storage.objects for update
  using (
    bucket_id in ('logos','media-images','media-videos','thumbnails','temp-imports')
    and (public.is_platform_admin() or (
      public.has_role('operador')
      and public.is_org_member((coalesce((metadata->>'organization_id')::uuid, public.current_organization_id())))
    ))
  )
  with check (
    bucket_id in ('logos','media-images','media-videos','thumbnails','temp-imports')
    and (public.is_platform_admin() or (
      public.has_role('operador')
      and public.is_org_member((coalesce((metadata->>'organization_id')::uuid, public.current_organization_id())))
    ))
  );

drop policy if exists "storage_org_delete_gestor_plus" on storage.objects;
create policy "storage_org_delete_gestor_plus" on storage.objects for delete
  using (
    bucket_id in ('logos','media-images','media-videos','thumbnails','temp-imports')
    and (public.is_platform_admin() or (
      public.has_role('gestor')
      and public.is_org_member((coalesce((metadata->>'organization_id')::uuid, public.current_organization_id())))
    ))
  );

-- 15b) Atribuições de playlist a telas / grupos (migrations posteriores)
drop policy if exists "screen_playlist_assignments_select_same_org" on public.screen_playlist_assignments;
create policy "screen_playlist_assignments_select_same_org"
  on public.screen_playlist_assignments for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

drop policy if exists "screen_playlist_assignments_write_operador_plus" on public.screen_playlist_assignments;
create policy "screen_playlist_assignments_write_operador_plus"
  on public.screen_playlist_assignments for all
  using ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin())
  with check ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin());

drop policy if exists "screen_group_playlist_assignments_select_same_org" on public.screen_group_playlist_assignments;
create policy "screen_group_playlist_assignments_select_same_org"
  on public.screen_group_playlist_assignments for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

drop policy if exists "screen_group_playlist_assignments_write_operador_plus" on public.screen_group_playlist_assignments;
create policy "screen_group_playlist_assignments_write_operador_plus"
  on public.screen_group_playlist_assignments for all
  using ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin())
  with check ((public.is_org_member(organization_id) and public.has_role('operador')) or public.is_platform_admin());

-- 16) Permissões catálogo + por papel (módulo)
insert into public.permission_catalog (key, name, description, module) values
  ('dashboard.view', 'Dashboard', 'Ver resumo', 'dashboard'),
  ('monitoramento.view', 'Monitoramento', 'Ver monitores', 'monitoramento'),
  ('telas.view', 'Telas', 'Ver dispositivos', 'telas'),
  ('telas.edit', 'Telas (edição)', 'Criar/editar telas', 'telas'),
  ('conteudo.edit', 'Conteúdo', 'Mídias, playlists, campanhas', 'conteudo'),
  ('usuarios.manage', 'Usuários', 'Gerir utilizadores', 'usuarios'),
  ('billing.view', 'Faturas', 'Ver faturas e assinatura', 'billing'),
  ('billing.manage', 'Cobrança', 'Alterar assinatura', 'billing'),
  ('saas.view', 'SaaS admin', 'Painel de plataforma', 'saas')
on conflict (key) do nothing;

insert into public.role_permissions (role, permission_key, allowed) values
  ('super_admin', 'saas.view', true),
  ('super_admin', 'dashboard.view', true),
  ('admin_master', 'dashboard.view', true),
  ('admin_master', 'usuarios.manage', true),
  ('admin_master', 'billing.view', true),
  ('admin_master', 'billing.manage', true),
  ('gestor', 'dashboard.view', true),
  ('gestor', 'telas.view', true),
  ('gestor', 'conteudo.edit', true),
  ('operador', 'conteudo.edit', true),
  ('operador', 'telas.view', true),
  ('visualizador', 'dashboard.view', true)
on conflict (role, permission_key) do nothing;

-- 17) Seed de planos (cents + slug)
insert into public.plans (code, slug, name, description, price_monthly_cents, price_yearly_cents,
  max_screens, max_users, max_storage_mb, max_playlists, max_campaigns, max_storage_gb, features, is_recommended, sort_order)
values
  ('starter','starter','Starter','Ideal para começar',9900,99000,3,2,5120,5,5,5,
    '["Até 3 telas","2 usuários","5 GB de armazenamento"]'::jsonb, false, 1),
  ('professional','professional','Professional','Crescimento',29900,299000,10,5,25600,20,20,25,
    '["Até 10 telas","24 GB de mídia","Relatórios"]'::jsonb, true, 2),
  ('business','business','Business','Multi-unidade',69900,699000,30,15,102400,50,50,100,
    '["Até 30 telas","100 GB de mídia","Suporte prioridade"]'::jsonb, false, 3),
  ('enterprise','enterprise','Enterprise','Sob medida',199900,1999000,9999,9999,1048576,9999,9999,1000,
    '["Recursos alargados","SLA"]'::jsonb, false, 4)
on conflict (code) do nothing;

comment on function public.get_user_saas_context is
  'Contexto do utilizador: perfil, org, assinatura, plano, licença, uso.';

comment on function public.check_plan_limit is
  'Valida limites antes de inserir recurso. Chamar a partir de triggers ou aplicação.';

comment on function public.is_platform_admin is
  'True se o profile actual tem role super_admin.';

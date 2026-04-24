-- ============================================================================
-- Signix SaaS — billing layer + super_admin role + module permissions
-- ============================================================================
-- Aplicar via: supabase migration new saas_billing && colar este conteúdo
-- ou: copie este arquivo para supabase/migrations/<timestamp>_saas_billing.sql
-- e rode `supabase db push`.
--
-- Este arquivo é IDEMPOTENTE — pode ser executado múltiplas vezes.
-- ============================================================================

-- 1) Adicionar super_admin ao enum app_role (se ainda não existir)
do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'app_role' and e.enumlabel = 'super_admin'
  ) then
    alter type public.app_role add value 'super_admin';
  end if;
end$$;

-- 2) Helpers (security definer)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_super_admin(_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.has_role(_user_id, 'super_admin'), false)
$$;

create or replace function public.current_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.profiles where auth_user_id = auth.uid() limit 1
$$;

-- 3) PLANS — catálogo de planos SaaS
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  price_monthly_cents integer not null default 0,
  price_yearly_cents integer not null default 0,
  currency text not null default 'BRL',
  max_screens integer not null default 1,
  max_users integer not null default 1,
  max_storage_gb integer not null default 5,
  features jsonb not null default '[]'::jsonb,
  support_level text default 'standard',
  is_recommended boolean default false,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists plans_active_idx on public.plans(is_active, sort_order);

alter table public.plans enable row level security;
drop policy if exists "plans_public_read_active" on public.plans;
create policy "plans_public_read_active" on public.plans for select to anon, authenticated
using (is_active = true or public.is_super_admin());
drop policy if exists "plans_super_admin_manage" on public.plans;
create policy "plans_super_admin_manage" on public.plans for all to authenticated
using (public.is_super_admin()) with check (public.is_super_admin());

-- 4) SUBSCRIPTIONS
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null default 'trialing'
    check (status in ('trialing','active','past_due','canceled','expired','suspended')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly','yearly')),
  amount_cents integer not null default 0,
  currency text not null default 'BRL',
  trial_ends_at timestamptz,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '30 days'),
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  external_provider text,
  external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_org_idx on public.subscriptions(organization_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

alter table public.subscriptions enable row level security;
drop policy if exists "subs_org_read" on public.subscriptions;
create policy "subs_org_read" on public.subscriptions for select to authenticated
using (organization_id = public.current_org_id() or public.is_super_admin());
drop policy if exists "subs_super_admin_manage" on public.subscriptions;
create policy "subs_super_admin_manage" on public.subscriptions for all to authenticated
using (public.is_super_admin()) with check (public.is_super_admin());

-- 5) INVOICES
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  number text unique,
  status text not null default 'open'
    check (status in ('draft','open','paid','overdue','void','refunded')),
  amount_cents integer not null default 0,
  currency text not null default 'BRL',
  issued_at timestamptz not null default now(),
  due_at timestamptz,
  paid_at timestamptz,
  payment_method text,
  external_provider text,
  external_id text,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists invoices_org_idx on public.invoices(organization_id);
create index if not exists invoices_status_idx on public.invoices(status);

alter table public.invoices enable row level security;
drop policy if exists "invoices_org_read" on public.invoices;
create policy "invoices_org_read" on public.invoices for select to authenticated
using (organization_id = public.current_org_id() or public.is_super_admin());
drop policy if exists "invoices_super_admin_manage" on public.invoices;
create policy "invoices_super_admin_manage" on public.invoices for all to authenticated
using (public.is_super_admin()) with check (public.is_super_admin());

-- 6) LICENSES
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  key text unique not null default replace(gen_random_uuid()::text, '-', ''),
  status text not null default 'active'
    check (status in ('trial','active','expired','suspended','canceled')),
  max_screens integer not null default 1,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists licenses_org_idx on public.licenses(organization_id);

alter table public.licenses enable row level security;
drop policy if exists "licenses_org_read" on public.licenses;
create policy "licenses_org_read" on public.licenses for select to authenticated
using (organization_id = public.current_org_id() or public.is_super_admin());
drop policy if exists "licenses_super_admin_manage" on public.licenses;
create policy "licenses_super_admin_manage" on public.licenses for all to authenticated
using (public.is_super_admin()) with check (public.is_super_admin());

-- 7) USER_PERMISSIONS — controle granular por módulo
create table if not exists public.user_permissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  module text not null,
  can_view boolean not null default true,
  can_edit boolean not null default false,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, module)
);
create index if not exists user_permissions_profile_idx on public.user_permissions(profile_id);

alter table public.user_permissions enable row level security;
drop policy if exists "perm_self_read" on public.user_permissions;
create policy "perm_self_read" on public.user_permissions for select to authenticated
using (organization_id = public.current_org_id() or public.is_super_admin());
drop policy if exists "perm_master_manage" on public.user_permissions;
create policy "perm_master_manage" on public.user_permissions for all to authenticated
using (
  organization_id = public.current_org_id()
  and (public.has_role(auth.uid(), 'admin_master') or public.has_role(auth.uid(), 'gestor') or public.is_super_admin())
)
with check (
  organization_id = public.current_org_id()
  and (public.has_role(auth.uid(), 'admin_master') or public.has_role(auth.uid(), 'gestor') or public.is_super_admin())
);

-- 8) Trigger updated_at
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

do $$
declare t text;
begin
  for t in select unnest(array['plans','subscriptions','invoices','licenses','user_permissions'])
  loop
    execute format($f$
      drop trigger if exists trg_%I_updated on public.%I;
      create trigger trg_%I_updated before update on public.%I
      for each row execute function public.tg_set_updated_at();
    $f$, t, t, t, t);
  end loop;
end$$;

-- 9) Seed de planos (idempotente)
insert into public.plans (code, name, description, price_monthly_cents, price_yearly_cents,
  max_screens, max_users, max_storage_gb, features, is_recommended, sort_order)
values
  ('starter','Starter','Ideal para começar',9900,99000,3,2,5,
    '["Até 3 telas","2 usuários","Suporte por email"]'::jsonb, false, 1),
  ('professional','Professional','Para empresas em crescimento',29900,299000,10,5,25,
    '["Até 10 telas","5 usuários","Agendamentos avançados","Relatórios"]'::jsonb, true, 2),
  ('business','Business','Operação multi-unidade',69900,699000,30,15,100,
    '["Até 30 telas","15 usuários","Grupos de telas","API","Suporte prioritário"]'::jsonb, false, 3),
  ('enterprise','Enterprise','Sob medida e ilimitado',199900,1999000,9999,9999,1000,
    '["Telas ilimitadas","Usuários ilimitados","SLA 99.9%","Gerente dedicado"]'::jsonb, false, 4)
on conflict (code) do nothing;

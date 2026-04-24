-- ID do pagador (customer) no Asaas — evita duplicar cadastro
alter table public.organizations
  add column if not exists asaas_customer_id text;

comment on column public.organizations.asaas_customer_id is 'Identificador cus_xxx do cliente no Asaas.';

create index if not exists idx_organizations_asaas_customer
  on public.organizations (asaas_customer_id)
  where asaas_customer_id is not null;

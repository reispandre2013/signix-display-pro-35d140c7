-- Código secreto por organização para cadastro público de colaboradores (sem Admin Master).
-- No Supabase, `gen_random_bytes` vem de pgcrypto no schema `extensions`.
alter table public.organizations
  add column if not exists employee_signup_token text;

update public.organizations
set employee_signup_token = encode(extensions.gen_random_bytes(18), 'hex')
where employee_signup_token is null;

alter table public.organizations
  alter column employee_signup_token set default (encode(extensions.gen_random_bytes(18), 'hex'));

alter table public.organizations
  alter column employee_signup_token set not null;

create unique index if not exists idx_organizations_employee_signup_token
  on public.organizations (employee_signup_token);

-- Opcional: define o titular explícito da org DiagOrg (vincula owner_profile_id ao perfil do e-mail de cadastro).
-- Executar no SQL Editor do Supabase se o painel ainda não mostrar nome/e-mail corretos após o deploy do front.
update public.organizations o
set owner_profile_id = p.id
from public.profiles p
where o.name = 'DiagOrg'
  and p.organization_id = o.id
  and lower(trim(p.email)) = lower(trim('diag1776451638@gmail.com'));

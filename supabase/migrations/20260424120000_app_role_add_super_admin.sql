-- Valor de enum adicionado em transação separada: PG não permite usar
-- o novo rótulo (55P04) no mesmo ficheiro/transação após `ADD VALUE`.
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

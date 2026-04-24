-- ============================================================================
-- PATCH IDEMPOTENTE — corrige erro 42710 ao reaplicar a migration
-- 20260424200000_saas_platform_layer.sql
--
-- COMO USAR:
-- Cole este SQL no Supabase SQL Editor e execute. Em seguida, reaplique
-- a migration original — ou simplesmente rode este patch (já contém o
-- estado final correto das policies que estavam falhando).
-- ============================================================================

-- organizations
drop policy if exists "organizations_update_members" on public.organizations;
create policy "organizations_update_members" on public.organizations for update
  using (
    (public.is_org_member(id) and (public.has_role('admin_master') or public.has_role('gestor')))
    or public.is_platform_admin()
  )
  with check (
    (public.is_org_member(id) and (public.has_role('admin_master') or public.has_role('gestor')))
    or public.is_platform_admin()
  );

drop policy if exists "organizations_insert_platform" on public.organizations;
create policy "organizations_insert_platform" on public.organizations for insert
  with check (public.is_platform_admin());

-- ============================================================================
-- Permite ao Operador (e demais membros ativos da organização) visualizar
-- as faturas e pagamentos da própria empresa.
-- Execute no SQL Editor do Supabase (uma única vez).
-- ============================================================================

drop policy if exists "invoices_select" on public.invoices;
create policy "invoices_select" on public.invoices for select to authenticated
  using (
    public.is_platform_admin()
    or public.is_org_member(organization_id)
  );

drop policy if exists "payments_select" on public.payments;
create policy "payments_select" on public.payments for select to authenticated
  using (
    public.is_platform_admin()
    or public.is_org_member(organization_id)
  );

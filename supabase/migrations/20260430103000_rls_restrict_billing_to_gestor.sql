-- ============================================================================
-- Auditoria segurança — faturas e pagamentos: apenas Gestor+/Master ou plataforma
-- -----------------------------------------------------------------------------
-- Problema: SELECT em invoices/payments permitia qualquer membro da org (RLS só
-- filtrava organization_id).
-- Correção (mínima invasiva): operador/visualizador deixam de ler faturas e
-- linhas de pagamento via cliente Supabase. Subscriptions/licenses mantêm SELECT
-- na org por agora para não partir limites/UI (billing context, app.tsx requires_plan);
-- próximo endurecimento recomendado: sanitizar RPC get_user_saas_context.
-- Mutations já eram apenas super_admin; webhooks continuam por service_role.
-- ============================================================================

drop policy if exists "invoices_select" on public.invoices;
create policy "invoices_select" on public.invoices for select to authenticated
  using (
    public.is_platform_admin()
    or (
      organization_id = (select p.organization_id from public.profiles p where p.auth_user_id = auth.uid())
      and public.has_role('gestor')
    )
  );

drop policy if exists "payments_select" on public.payments;
create policy "payments_select" on public.payments for select to authenticated
  using (
    public.is_platform_admin()
    or (
      organization_id = (select p.organization_id from public.profiles p where p.auth_user_id = auth.uid())
      and public.has_role('gestor')
    )
  );

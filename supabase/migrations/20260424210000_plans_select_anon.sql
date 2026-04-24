-- Permite à página pública de preços (anon) listar planos ativos.
drop policy if exists "plans_read_public_anon" on public.plans;
create policy "plans_read_public_anon" on public.plans for select to anon
  using (is_active = true);

comment on policy "plans_read_public_anon" on public.plans is
  'Vitrine /checkout e /planos sem login; planos inactivos invisíveis.';

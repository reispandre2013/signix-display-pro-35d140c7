alter table public.checkout_sessions
  add column if not exists billing_cycle text default 'monthly';

comment on column public.checkout_sessions.billing_cycle is 'Ciclo no checkout: monthly|yearly.';

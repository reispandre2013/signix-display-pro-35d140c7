/**
 * Tipos de domínio SaaS (planos, assinaturas, faturas, licenças).
 * Espelham as tabelas em docs/supabase/migration-saas-billing.sql.
 */

export type PlanCode = "starter" | "professional" | "business" | "enterprise" | string;

export interface Plan {
  id: string;
  code: PlanCode;
  name: string;
  description: string | null;
  price_monthly_cents: number;
  price_yearly_cents: number;
  currency: string;
  max_screens: number;
  max_users: number;
  max_storage_gb: number;
  features: string[];
  support_level: string | null;
  is_recommended: boolean;
  is_active: boolean;
  sort_order: number;
}

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "suspended"
  | "pending";

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  plan?: Plan;
  status: SubscriptionStatus;
  billing_cycle: "monthly" | "yearly";
  amount_cents: number;
  currency: string;
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
}

export type InvoiceStatus = "draft" | "open" | "paid" | "overdue" | "void" | "refunded";

export interface Invoice {
  id: string;
  organization_id: string;
  subscription_id: string | null;
  number: string | null;
  status: InvoiceStatus;
  amount_cents: number;
  currency: string;
  issued_at: string;
  due_at: string | null;
  paid_at: string | null;
  payment_method: string | null;
  pdf_url: string | null;
}

export type LicenseStatus = "trial" | "active" | "expired" | "suspended" | "canceled";

export interface License {
  id: string;
  organization_id: string;
  subscription_id: string | null;
  key: string;
  status: LicenseStatus;
  max_screens: number;
  valid_from: string;
  valid_until: string | null;
}

export interface SaasClient {
  organization_id: string;
  organization_name: string;
  master_email: string | null;
  plan_name: string | null;
  subscription_status: SubscriptionStatus | null;
  screens_used: number;
  screens_limit: number;
  created_at: string;
  last_payment_at: string | null;
  license_status: LicenseStatus | null;
}

export function formatPrice(cents: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(cents / 100);
}

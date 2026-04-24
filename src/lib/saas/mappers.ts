import type { Invoice, License, Plan, SaasClient, Subscription, InvoiceStatus } from "@/types/saas";

/** Linha mínima de `plans` vinda do Supabase (campos usados no UI). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPlanRow(row: any): Plan {
  const featuresRaw = row.features;
  const features: string[] = Array.isArray(featuresRaw)
    ? featuresRaw.map(String)
    : typeof featuresRaw === "string"
      ? (() => {
          try {
            const p = JSON.parse(featuresRaw) as unknown;
            return Array.isArray(p) ? p.map(String) : [];
          } catch {
            return [];
          }
        })()
      : [];

  const maxGb =
    row.max_storage_gb != null
      ? Number(row.max_storage_gb)
      : row.max_storage_mb != null
        ? Math.round((Number(row.max_storage_mb) / 1000) * 10) / 10
        : 0;

  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    description: row.description == null ? null : String(row.description),
    price_monthly_cents: Number(row.price_monthly_cents ?? 0),
    price_yearly_cents: Number(row.price_yearly_cents ?? 0),
    currency: String(row.currency ?? "BRL"),
    max_screens: Number(row.max_screens ?? 0),
    max_users: Number(row.max_users ?? 0),
    max_storage_gb: maxGb,
    features,
    support_level: row.support_level == null ? null : String(row.support_level),
    is_recommended: Boolean(row.is_recommended),
    is_active: row.is_active !== false,
    sort_order: Number(row.sort_order ?? 0),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapSubscriptionRow(sub: any, planRow: any | null): Subscription {
  const plan = planRow ? mapPlanRow(planRow) : undefined;
  const st = String(sub.status ?? "active");
  const allowed: Subscription["status"][] = [
    "trialing",
    "active",
    "past_due",
    "canceled",
    "expired",
    "suspended",
    "pending",
  ];
  const status = (allowed.includes(st as Subscription["status"])
    ? st
    : "active") as Subscription["status"];

  const now = new Date().toISOString();
  return {
    id: String(sub.id),
    organization_id: String(sub.organization_id),
    plan_id: String(sub.plan_id),
    plan,
    status,
    billing_cycle: sub.billing_cycle === "yearly" ? "yearly" : "monthly",
    amount_cents: Number(sub.amount_cents ?? 0),
    currency: String(sub.currency ?? "BRL"),
    trial_ends_at: sub.trial_ends_at ?? null,
    current_period_start: sub.current_period_start ?? now,
    current_period_end: sub.current_period_end ?? now,
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    canceled_at: sub.canceled_at ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapInvoiceRow(row: any): Invoice {
  const st = String(row.status ?? "open");
  const allowed: InvoiceStatus[] = ["draft", "open", "paid", "overdue", "void", "refunded"];
  const status = (allowed.includes(st as InvoiceStatus) ? st : "open") as InvoiceStatus;
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    subscription_id: row.subscription_id == null ? null : String(row.subscription_id),
    number: row.number == null ? null : String(row.number),
    status,
    amount_cents: Number(row.amount_cents ?? 0),
    currency: String(row.currency ?? "BRL"),
    issued_at: row.issued_at ?? new Date().toISOString(),
    due_at: row.due_at ?? row.due_date ?? null,
    paid_at: row.paid_at ?? null,
    payment_method: row.payment_method == null ? null : String(row.payment_method),
    pdf_url: row.pdf_url == null || row.pdf_url === "" ? row.invoice_url ?? null : String(row.pdf_url),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapLicenseRow(row: any): License {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    subscription_id: row.subscription_id == null ? null : String(row.subscription_id),
    key: String(row.license_key ?? row.key ?? ""),
    status: (String(row.status) ?? "active") as License["status"],
    max_screens: Number(row.max_screens ?? 0),
    valid_from: row.valid_from ?? row.activated_at ?? new Date().toISOString(),
    valid_until: row.valid_until ?? row.expires_at ?? null,
  };
}

export type SaasUsageDisplay = {
  screens_used: number;
  screens_limit: number;
  users_used: number;
  users_limit: number;
  storage_used_gb: number;
  storage_limit_gb: number;
};

export function buildUsageDisplay(
  usage: { total_screens: number; total_users: number; storage_used_mb: number } | null,
  plan: Plan | undefined,
  license: { max_screens: number; max_users: number; max_storage_mb: number } | null,
): SaasUsageDisplay {
  const screensLimit = license?.max_screens ?? plan?.max_screens ?? 9999;
  const usersLimit = license?.max_users ?? plan?.max_users ?? 9999;
  const storageLimitMb =
    license?.max_storage_mb != null
      ? Number(license.max_storage_mb)
      : plan
        ? (plan.max_storage_gb ?? 0) * 1000
        : 100000;
  return {
    screens_used: usage?.total_screens ?? 0,
    screens_limit: screensLimit,
    users_used: usage?.total_users ?? 0,
    users_limit: usersLimit,
    storage_used_gb: Math.round(((usage?.storage_used_mb as number) ?? 0) * 10) / 10,
    storage_limit_gb: Math.max(0.1, Math.round((storageLimitMb / 1000) * 10) / 10),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildSaasClientRow(
  org: { id: string; name: string; created_at: string },
  sub: { status: string; plan?: { name?: string } } | null,
  lic: { status: string } | null,
  masterEmail: string | null,
  usage: { total_screens: number } | null,
  planForLimit: { max_screens: number } | null,
  lastPaidAt: string | null,
): SaasClient {
  const st = (sub?.status as SaasClient["subscription_status"]) ?? null;
  return {
    organization_id: org.id,
    organization_name: org.name,
    master_email: masterEmail,
    plan_name: sub?.plan?.name ? String(sub.plan.name) : null,
    subscription_status: st,
    screens_used: usage?.total_screens ?? 0,
    screens_limit: planForLimit?.max_screens ?? 9999,
    created_at: org.created_at,
    last_payment_at: lastPaidAt,
    license_status: (lic?.status as License["status"]) ?? null,
  };
}

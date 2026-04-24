import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  buildSaasClientRow,
  buildUsageDisplay,
  mapInvoiceRow,
  mapPlanRow,
  mapSubscriptionRow,
  type SaasUsageDisplay,
} from "@/lib/saas/mappers";
import type { Invoice, Plan, SaasClient, Subscription } from "@/types/saas";

function isMissingRelation(error: unknown, relation: string): boolean {
  const msg = String((error as { message?: string } | null)?.message ?? "").toLowerCase();
  const rel = relation.toLowerCase();
  return (
    msg.includes(`relation "${rel}" does not exist`) ||
    msg.includes(`could not find the table`) && msg.includes(rel)
  );
}

/** Planos ativos — funciona com sessão anon (página /planos) após migration RLS. */
export function usePublicPlans() {
  return useQuery({
    queryKey: ["saas", "plans", "active"],
    queryFn: async (): Promise<Plan[]> => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) {
        if (isMissingRelation(error, "plans")) return [];
        throw new Error(error.message);
      }
      return (data ?? []).map((r) => mapPlanRow(r));
    },
    staleTime: 60_000,
  });
}

/** Catálogo completo (inclui inativos) — super admin. */
export function useAdminPlansCatalog() {
  const { profile } = useAuth();
  const ok = profile?.role === "super_admin";
  return useQuery({
    queryKey: ["saas", "plans", "catalog"],
    queryFn: async (): Promise<Plan[]> => {
      const { data, error } = await supabase.from("plans").select("*").order("sort_order", { ascending: true });
      if (error) {
        if (isMissingRelation(error, "plans")) return [];
        throw new Error(error.message);
      }
      return (data ?? []).map((r) => mapPlanRow(r));
    },
    enabled: ok,
    staleTime: 30_000,
  });
}

export type OrgBillingBundle = {
  subscription: Subscription | null;
  usage: SaasUsageDisplay;
  /** Plano efectivo para limites (subscription.plan ou fallback). */
  plan: Plan | undefined;
};

export function useOrgBillingContext(): {
  data: OrgBillingBundle | undefined;
  isLoading: boolean;
  error: Error | null;
  isMissingTables: boolean;
} {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? null;

  const q = useQuery({
    queryKey: ["saas", "org", orgId, "billing"],
    enabled: Boolean(orgId) && profile?.role !== "super_admin",
    queryFn: async (): Promise<OrgBillingBundle> => {
      const { data: subRow, error: e1 } = await supabase
        .from("subscriptions")
        .select("*, plans(*)")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (e1) {
        if (isMissingRelation(e1, "subscriptions")) {
          return {
            subscription: null,
            usage: buildUsageDisplay(null, undefined, null),
            plan: undefined,
          };
        }
        throw new Error(e1.message);
      }

      const planObj = subRow?.plans;
      const planData = Array.isArray(planObj) ? planObj[0] : planObj;
      const subscription = subRow
        ? mapSubscriptionRow(subRow, planData ?? null)
        : null;
      const plan = subscription?.plan;

      const { data: usageRow } = await supabase
        .from("usage_counters")
        .select("total_screens, total_users, storage_used_mb")
        .eq("organization_id", orgId!)
        .maybeSingle();

      const { data: licRow } = await supabase
        .from("licenses")
        .select("max_screens, max_users, max_storage_mb")
        .eq("organization_id", orgId!)
        .in("status", ["trial", "active"])
        .order("valid_from", { ascending: false })
        .limit(1)
        .maybeSingle();

      const usage = buildUsageDisplay(
        usageRow
          ? {
              total_screens: Number(usageRow.total_screens ?? 0),
              total_users: Number(usageRow.total_users ?? 0),
              storage_used_mb: Number(usageRow.storage_used_mb ?? 0),
            }
          : null,
        plan,
        licRow
          ? {
              max_screens: Number(licRow.max_screens ?? 0),
              max_users: Number(licRow.max_users ?? 0),
              max_storage_mb: Number(licRow.max_storage_mb ?? 0),
            }
          : null,
      );

      return { subscription, usage, plan };
    },
    staleTime: 20_000,
  });

  const err = q.error as Error | null;
  const isMissing =
    err != null &&
    (String(err.message).includes("does not exist") || String(err.message).includes("schema cache"));

  return {
    data: q.data,
    isLoading: q.isLoading,
    error: err,
    isMissingTables: Boolean(isMissing),
  };
}

export function useOrgInvoices() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? null;

  return useQuery({
    queryKey: ["saas", "invoices", orgId],
    enabled: Boolean(orgId) && profile?.role !== "super_admin",
    queryFn: async (): Promise<Invoice[]> => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("organization_id", orgId!)
        .order("issued_at", { ascending: false });
      if (error) {
        if (isMissingRelation(error, "invoices")) return [];
        throw new Error(error.message);
      }
      return (data ?? []).map((r) => mapInvoiceRow(r));
    },
    staleTime: 30_000,
  });
}

/** Diretório para painel super admin: une orgs, última assinatura, uso, licença, master. */
export function useSaasDirectory() {
  const { profile } = useAuth();
  const ok = profile?.role === "super_admin";

  return useQuery({
    queryKey: ["saas", "directory"],
    enabled: ok,
    queryFn: async (): Promise<SaasClient[]> => {
      const { data: orgs, error: e1 } = await supabase
        .from("organizations")
        .select("id, name, created_at")
        .order("created_at", { ascending: false });
      if (e1) {
        if (isMissingRelation(e1, "organizations")) return [];
        throw new Error(e1.message);
      }
      if (!orgs?.length) return [];

      const orgIds = orgs.map((o) => o.id);

      const [subsQ, { data: usages }, { data: lics }, { data: profs }, payQ] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("id, organization_id, status, created_at, plans(name, max_screens)")
          .in("organization_id", orgIds),
        supabase.from("usage_counters").select("organization_id, total_screens").in("organization_id", orgIds),
        supabase.from("licenses").select("organization_id, status, valid_from").in("organization_id", orgIds),
        supabase
          .from("profiles")
          .select("organization_id, email, role, created_at")
          .in("organization_id", orgIds)
          .in("role", ["admin_master", "gestor", "super_admin"]),
        supabase
          .from("payments")
          .select("organization_id, paid_at, amount_cents, status, created_at")
          .in("organization_id", orgIds)
          .order("created_at", { ascending: false }),
      ]);
      if (subsQ.error && isMissingRelation(subsQ.error, "subscriptions")) {
        /* tabela ainda não aplicada */
      } else if (subsQ.error) {
        throw new Error(subsQ.error.message);
      }
      const subs = subsQ.data ?? [];
      if (payQ.error && isMissingRelation(payQ.error, "payments")) {
        /* tabela ainda não aplicada */
      } else if (payQ.error) {
        throw new Error(payQ.error.message);
      }
      const payStats = payQ.data ?? [];

      const latestLicByOrg = new Map<string, { status: string }>();
      for (const oid of orgIds) {
        const list = (lics ?? []).filter((l) => l.organization_id === oid);
        if (!list.length) continue;
        const best = list.reduce((a, b) =>
          new Date((a as { valid_from: string }).valid_from).getTime() >=
          new Date((b as { valid_from: string }).valid_from).getTime()
            ? a
            : b,
        );
        latestLicByOrg.set(oid, { status: String((best as { status: string }).status) });
      }

      const usageByOrg = new Map((usages ?? []).map((u) => [u.organization_id as string, u]));
      const lastPaidByOrg = new Map<string, string | null>();
      for (const oid of orgIds) {
        const list = (payStats ?? []).filter(
          (p) =>
            p.organization_id === oid &&
            (p as { paid_at: string | null }).paid_at &&
            String((p as { status: string }).status) !== "failed",
        ) as { paid_at: string; created_at: string }[];
        if (!list.length) {
          lastPaidByOrg.set(oid, null);
          continue;
        }
        const best = list.sort(
          (a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime(),
        )[0];
        lastPaidByOrg.set(oid, best.paid_at);
      }

      return orgs.map((org) => {
        const subList = (subs ?? []).filter((s) => s.organization_id === org.id);
        const latest = subList.sort(
          (a, b) => new Date((b as { created_at: string }).created_at).getTime() - new Date((a as { created_at: string }).created_at).getTime(),
        )[0];
        const planEmbed = latest?.plans as { name?: string; max_screens?: number } | { name?: string; max_screens?: number }[] | null;
        const planOne = Array.isArray(planEmbed) ? planEmbed[0] : planEmbed;
        const planName = planOne?.name;
        const planScreens = planOne?.max_screens;
        const masters = (profs ?? []).filter((p) => p.organization_id === org.id && p.role === "admin_master");
        const masterEmail = masters[0]?.email ?? (profs ?? []).find((p) => p.organization_id === org.id)?.email ?? null;
        const u = usageByOrg.get(org.id);
        return buildSaasClientRow(
          { id: org.id, name: org.name, created_at: org.created_at },
          latest
            ? { status: String((latest as { status: string }).status), plan: { name: planName } }
            : null,
          latestLicByOrg.get(org.id) ?? null,
          masterEmail,
          u ? { total_screens: Number(u.total_screens ?? 0) } : null,
          planScreens != null ? { max_screens: planScreens } : null,
          lastPaidByOrg.get(org.id) ?? null,
        );
      });
    },
    staleTime: 30_000,
  });
}

type PaymentRow = {
  id: string;
  client: string;
  amount_cents: number;
  method: string;
  status: string;
  created_at: string;
};

export function useRecentSaaSPayments(limit = 8) {
  const { profile } = useAuth();
  const ok = profile?.role === "super_admin";

  return useQuery({
    queryKey: ["saas", "payments", "recent", limit],
    enabled: ok,
    queryFn: async (): Promise<PaymentRow[]> => {
      const { data, error } = await supabase
        .from("payments")
        .select("id, amount_cents, status, created_at, method, organization_id, organizations(name)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) {
        if (isMissingRelation(error, "payments")) return [];
        throw new Error(error.message);
      }
      return (data ?? []).map((r) => {
        const o = (r as { organizations?: { name: string } | { name: string }[] | null }).organizations;
        const name = Array.isArray(o) ? o[0]?.name : o?.name;
        return {
          id: String((r as { id: string }).id),
          client: name ?? "—",
          amount_cents: Number((r as { amount_cents: number }).amount_cents),
          method: String((r as { method?: string }).method ?? "—"),
          status: String((r as { status: string }).status) === "failed" || String((r as { status: string }).status) === "pending" ? "pending" : "paid",
          created_at: String((r as { created_at: string }).created_at),
        };
      });
    },
    staleTime: 20_000,
  });
}

export type SaasMetrics = {
  total_companies: number;
  active_subscriptions: number;
  expired_subscriptions: number;
  canceled_subscriptions: number;
  mrr_cents: number;
  arr_cents: number;
  new_clients_30d: number;
  churn_rate: number;
  overdue_invoices_count: number;
  total_active_screens: number;
};

export function useSaasMetrics() {
  const { profile } = useAuth();
  const ok = profile?.role === "super_admin";

  return useQuery({
    queryKey: ["saas", "metrics"],
    enabled: ok,
    queryFn: async (): Promise<SaasMetrics> => {
      const [orgsQ, subs, inv, usageRows] = await Promise.all([
        supabase.from("organizations").select("id, created_at"),
        supabase
          .from("subscriptions")
          .select("id, status, amount_cents, billing_cycle, created_at, organization_id"),
        supabase
          .from("invoices")
          .select("id, status, due_date, amount_cents, due_at")
          .in("status", ["open", "overdue", "draft"]),
        supabase.from("usage_counters").select("total_screens"),
      ]);

      if (orgsQ.error && isMissingRelation(orgsQ.error, "organizations")) {
        return emptyMetrics();
      }
      if (subs.error && isMissingRelation(subs.error, "subscriptions")) {
        return emptyMetrics();
      }

      const orgRows = orgsQ.data ?? [];
      const total = orgRows.length;
      const srows = subs.data ?? [];
      const now = new Date();
      const d30 = new Date(now.getTime() - 30 * 86400000);
      const newClients = orgRows.filter((o) => new Date(o.created_at) >= d30).length;

      const active = srows.filter((r) => r.status === "active" || r.status === "trialing").length;
      const expired = srows.filter((r) => r.status === "expired").length;
      const canceled = srows.filter((r) => r.status === "canceled").length;
      const mrr = srows
        .filter((r) => r.status === "active" || r.status === "trialing")
        .reduce((acc, r) => {
          const a = Number(r.amount_cents ?? 0);
          return acc + (r.billing_cycle === "yearly" ? Math.round(a / 12) : a);
        }, 0);
      const overdue = (inv.data ?? []).filter((i) => (i as { status: string }).status === "overdue").length;
      const screens = (usageRows.data ?? []).reduce((a, u) => a + Number(u.total_screens ?? 0), 0);

      return {
        total_companies: total,
        active_subscriptions: active,
        expired_subscriptions: expired,
        canceled_subscriptions: canceled,
        mrr_cents: mrr,
        arr_cents: mrr * 12,
        new_clients_30d: newClients,
        churn_rate: total ? Math.min(100, Math.round((canceled / total) * 1000) / 10) : 0,
        overdue_invoices_count: overdue,
        total_active_screens: screens,
      };
    },
    staleTime: 60_000,
  });
}

function emptyMetrics(): SaasMetrics {
  return {
    total_companies: 0,
    active_subscriptions: 0,
    expired_subscriptions: 0,
    canceled_subscriptions: 0,
    mrr_cents: 0,
    arr_cents: 0,
    new_clients_30d: 0,
    churn_rate: 0,
    overdue_invoices_count: 0,
    total_active_screens: 0,
  };
}

type AuditListItem = { id: string; actor: string; action: string; target: string; created_at: string };

export function useAuditLogPreview(limit = 20) {
  const { profile } = useAuth();
  const ok = profile?.role === "super_admin";

  return useQuery({
    queryKey: ["saas", "audit", limit],
    enabled: ok,
    queryFn: async (): Promise<AuditListItem[]> => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, created_at, actor_profile_id, organization_id, new_data")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) {
        if (isMissingRelation(error, "audit_logs")) return [];
        throw new Error(error.message);
      }
      const profIds = [...new Set((data ?? []).map((r) => (r as { actor_profile_id: string | null }).actor_profile_id).filter(Boolean))] as string[];
      let nameBy = new Map<string, string>();
      if (profIds.length) {
        const { data: p } = await supabase.from("profiles").select("id, name, email").in("id", profIds);
        nameBy = new Map((p ?? []).map((x) => [x.id, x.name || x.email || "—"]));
      }
      return (data ?? []).map((row) => {
        const r = row as {
          id: string;
          action: string;
          entity_type: string;
          actor_profile_id: string | null;
          new_data: unknown;
          created_at: string;
        };
        const who = r.actor_profile_id ? nameBy.get(r.actor_profile_id) ?? "—" : "Sistema";
        return {
          id: r.id,
          actor: who,
          action: r.action,
          target: r.entity_type,
          created_at: r.created_at,
        };
      });
    },
    staleTime: 30_000,
  });
}

/** Um plano por code — para /checkout. */
export function usePlanByCode(code: string | null | undefined) {
  const c = (code && code.length > 0 ? code : "professional").trim();
  return useQuery({
    queryKey: ["saas", "plan", "code", c],
    queryFn: async (): Promise<Plan | null> => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("code", c)
        .eq("is_active", true)
        .maybeSingle();
      if (error) {
        if (isMissingRelation(error, "plans")) return null;
        throw new Error(error.message);
      }
      return data ? mapPlanRow(data) : null;
    },
  });
}

export type LicenseTableRow = {
  id: string;
  org_name: string;
  key: string;
  plan_name: string | null;
  status: string;
  max_screens: number;
  valid_from: string;
  valid_until: string | null;
};

export function useSaaSLicensesList() {
  const { profile } = useAuth();
  const ok = profile?.role === "super_admin";
  return useQuery({
    queryKey: ["saas", "licenses", "all"],
    enabled: ok,
    queryFn: async (): Promise<LicenseTableRow[]> => {
      const { data, error } = await supabase
        .from("licenses")
        .select("id, license_key, key, status, max_screens, valid_from, valid_until, plans(name), organizations(name)")
        .order("valid_from", { ascending: false });
      if (error) {
        if (isMissingRelation(error, "licenses")) return [];
        throw new Error(error.message);
      }
      return (data ?? []).map((row) => {
        const o = (row as { organizations?: { name: string } | { name: string }[] }).organizations;
        const p = (row as { plans?: { name: string } | { name: string }[] }).plans;
        return {
          id: String((row as { id: string }).id),
          org_name: (Array.isArray(o) ? o[0]?.name : o?.name) ?? "—",
          key: String((row as { license_key?: string; key?: string }).license_key ?? (row as { key?: string }).key ?? ""),
          plan_name: (Array.isArray(p) ? p[0]?.name : p?.name) ?? null,
          status: String((row as { status: string }).status),
          max_screens: Number((row as { max_screens: number }).max_screens),
          valid_from: String((row as { valid_from: string }).valid_from),
          valid_until: (row as { valid_until: string | null }).valid_until,
        };
      });
    },
    staleTime: 30_000,
  });
}

export type SubscriptionsTableRow = {
  id: string;
  org_id: string;
  org_name: string;
  plan_name: string | null;
  status: string;
  billing_cycle: string;
  amount_cents: number;
  current_period_start: string;
  current_period_end: string | null;
  created_at: string;
  last_paid: string | null;
};

export function useSaaSAllSubscriptions() {
  const { profile } = useAuth();
  const ok = profile?.role === "super_admin";
  return useQuery({
    queryKey: ["saas", "subscriptions", "all"],
    enabled: ok,
    queryFn: async (): Promise<SubscriptionsTableRow[]> => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          "id, organization_id, status, billing_cycle, amount_cents, current_period_start, current_period_end, created_at, plans(name), organizations(name)",
        )
        .order("created_at", { ascending: false });
      if (error) {
        if (isMissingRelation(error, "subscriptions")) return [];
        throw new Error(error.message);
      }
      const { data: payAll } = await supabase
        .from("payments")
        .select("organization_id, paid_at, status, created_at")
        .order("created_at", { ascending: false });
      const orgIds = [...new Set((data ?? []).map((r) => (r as { organization_id: string }).organization_id))];
      const lastPaid = new Map<string, string | null>();
      for (const oid of orgIds) {
        const t = (payAll ?? [])
          .filter(
            (p) =>
              p.organization_id === oid &&
              (p as { paid_at: string | null }).paid_at &&
              String((p as { status: string }).status) !== "failed",
          ) as { paid_at: string; created_at: string }[];
        t.sort(
          (a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime(),
        );
        lastPaid.set(oid, t[0]?.paid_at ?? null);
      }
      return (data ?? []).map((row) => {
        const o = (row as { organizations?: { name: string } | { name: string }[] }).organizations;
        const p = (row as { plans?: { name: string } | { name: string }[] }).plans;
        const oid = String((row as { organization_id: string }).organization_id);
        return {
          id: String((row as { id: string }).id),
          org_id: oid,
          org_name: (Array.isArray(o) ? o[0]?.name : o?.name) ?? "—",
          plan_name: (Array.isArray(p) ? p[0]?.name : p?.name) ?? null,
          status: String((row as { status: string }).status),
          billing_cycle: (row as { billing_cycle: string }).billing_cycle === "yearly" ? "Anual" : "Mensal",
          amount_cents: Number((row as { amount_cents: number }).amount_cents),
          current_period_start: (row as { current_period_start: string | null }).current_period_start ?? (row as { created_at: string }).created_at,
          current_period_end: (row as { current_period_end: string | null }).current_period_end,
          created_at: String((row as { created_at: string }).created_at),
          last_paid: lastPaid.get(oid) ?? null,
        };
      });
    },
    staleTime: 30_000,
  });
}

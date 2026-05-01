import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CreditCard,
  Tv,
  Users,
  HardDrive,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle,
  Receipt,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
} from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { useOrgBillingContext, useOrgInvoices } from "@/lib/hooks/use-saas-data";
import { formatPrice } from "@/types/saas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, type ComponentType } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  reconcileAsaasPayments,
  validateAsaasConfig,
  type AsaasValidationResult,
} from "@/lib/server/billing.functions";
import { withAuthHeader } from "@/lib/server/with-auth-header";
import { toast } from "sonner";

export const Route = createFileRoute("/app/assinatura")({
  head: () => ({ meta: [{ title: "Minha assinatura — SigPlayer" }] }),
  component: AssinaturaPage,
});

function AssinaturaPage() {
  const { data: bundle, isLoading: loadingBundle, isMissingTables } = useOrgBillingContext();
  const { data: invoices = [], isLoading: loadingInv } = useOrgInvoices();
  const sub = bundle?.subscription;
  const u = bundle?.usage;
  const loading = loadingBundle || loadingInv;
  const queryClient = useQueryClient();
  const reconcileFn = useServerFn(reconcileAsaasPayments);
  const validateFn = useServerFn(validateAsaasConfig);
  const [syncing, setSyncing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<AsaasValidationResult | null>(null);

  const runValidation = async (): Promise<AsaasValidationResult | null> => {
    setValidating(true);
    try {
      const res = await withAuthHeader(() => validateFn());
      setValidation(res);
      return res;
    } catch (e) {
      const err: AsaasValidationResult = {
        ok: false,
        environment: "unknown",
        base_url: "",
        key_prefix: null,
        key_set: false,
        message: e instanceof Error ? e.message : "Falha na validação.",
      };
      setValidation(err);
      return err;
    } finally {
      setValidating(false);
    }
  };

  const handleValidate = async () => {
    const r = await runValidation();
    if (r?.ok) toast.success(r.message);
    else if (r) toast.error(r.message, { duration: 8000 });
  };

  const handleSync = async () => {
    // Bloqueia se já houve validação e falhou; revalida antes de sincronizar.
    setSyncing(true);
    try {
      const v = await runValidation();
      if (!v?.ok) {
        toast.error(
          `Configuração Asaas inválida — ${v?.message ?? "erro desconhecido"}`,
          { duration: 10000 },
        );
        return;
      }
      const res = await withAuthHeader(() => reconcileFn());
      console.log("[reconcile] result", res);
      if (res.ok) {
        toast.success(res.message);
        await queryClient.invalidateQueries({ queryKey: ["saas"] });
      } else {
        const detail = res.errors?.length ? `${res.message} — ${res.errors.join(" | ")}` : res.message;
        toast.error(detail, { duration: 10000 });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao sincronizar.");
    } finally {
      setSyncing(false);
    }
  };

  const screensPct = u && u.screens_limit > 0 ? (u.screens_used / u.screens_limit) * 100 : 0;
  const usersPct = u && u.users_limit > 0 ? (u.users_used / u.users_limit) * 100 : 0;
  const storageUsedMb =
    u && u.storage_limit_mb > 0
      ? u.storage_used_mb
      : u
        ? Math.round((u.storage_used_gb ?? 0) * 1000)
        : 0;
  const storageLimitMb =
    u && u.storage_limit_mb > 0
      ? u.storage_limit_mb
      : u
        ? Math.round((u.storage_limit_gb ?? 0) * 1000)
        : 0;
  const storagePct = storageLimitMb > 0 ? (storageUsedMb / storageLimitMb) * 100 : 0;

  if (loading && !bundle) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isMissingTables) {
    return (
      <div className="space-y-4">
        <PageHeader title="Minha assinatura" subtitle="Billing via Supabase." />
        <Panel>
          <p className="text-sm text-muted-foreground">
            Tabelas SaaS ainda não aplicadas neste ambiente. Execute as migrations em{" "}
            <code className="text-xs">supabase/migrations</code> (planos, assinaturas, faturas).
          </p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minha assinatura"
        subtitle="Gerencie seu plano, limites e cobranças."
        actions={
          <Link
            to="/planos"
            className="inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow"
          >
            <ArrowUpCircle className="h-3.5 w-3.5" /> Fazer upgrade
          </Link>
        }
      />

      {!sub ? (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Ainda não há assinatura registrada para esta organização. Escolha um plano para ativar o
            billing.
          </p>
          <Link to="/planos" className="mt-3 inline-flex text-sm font-medium text-primary">
            Ver planos →
          </Link>
        </Panel>
      ) : (
        <Panel>
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-primary grid place-items-center shadow-glow text-primary-foreground">
                <CreditCard className="h-7 w-7" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Plano atual
                </p>
                <h3 className="font-display text-2xl font-bold">{sub.plan?.name ?? "—"}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge
                    tone={
                      sub.status === "active" || sub.status === "trialing" ? "success" : "warning"
                    }
                    label={
                      sub.status === "active"
                        ? "Ativa"
                        : sub.status === "trialing"
                          ? "Trial"
                          : sub.status
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    Cobrança {sub.billing_cycle === "monthly" ? "mensal" : "anual"}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-bold">
                {formatPrice(sub.amount_cents)}
                <span className="text-sm text-muted-foreground">/mês</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                <Calendar className="h-3 w-3" /> Próxima cobrança em{" "}
                {format(new Date(sub.current_period_end), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </Panel>
      )}

      {u ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UsageCard
            label="Telas em uso"
            used={u.screens_used}
            limit={u.screens_limit}
            pct={screensPct}
            icon={Tv}
            unit=""
          />
          <UsageCard
            label="Usuários"
            used={u.users_used}
            limit={u.users_limit}
            pct={usersPct}
            icon={Users}
            unit=""
          />
          <UsageCard
            label="Armazenamento"
            used={storageUsedMb}
            limit={storageLimitMb}
            pct={Number.isFinite(storagePct) ? storagePct : 0}
            icon={HardDrive}
            unit="MB"
          />
        </div>
      ) : null}

      {u && screensPct >= 80 && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-warning">
              Você está próximo do limite de telas
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Faça upgrade do plano para liberar mais telas e evitar bloqueio de novas ativações.
            </p>
          </div>
          <Link to="/planos" className="text-xs font-semibold text-primary hover:underline">
            Ver planos →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2" title="Histórico de faturas">
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-5 py-2 font-medium">Número</th>
                  <th className="px-3 py-2 font-medium">Emissão</th>
                  <th className="px-3 py-2 font-medium">Valor</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-5 py-2 font-medium text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-sm text-muted-foreground">
                      Sem faturas registradas.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-5 py-3 font-mono text-xs">{inv.number ?? "—"}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {format(new Date(inv.issued_at), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">
                        {formatPrice(inv.amount_cents)}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge
                          tone={inv.status === "paid" ? "success" : "warning"}
                          label={inv.status === "paid" ? "Paga" : "Em aberto"}
                          withDot={false}
                        />
                      </td>
                      <td className="px-5 py-3 text-right">
                        {inv.pdf_url ? (
                          <a
                            href={inv.pdf_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-surface"
                          >
                            <Receipt className="h-3 w-3" /> Baixar
                          </a>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Ações da assinatura">
          <div className="space-y-2">
            <AsaasConfigCheck
              validation={validation}
              validating={validating}
              onValidate={handleValidate}
            />
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing || validating}
              className="w-full flex items-center justify-between gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm hover:bg-primary/10 disabled:opacity-60"
            >
              <span className="flex items-center gap-2">
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <RefreshCw className="h-4 w-4 text-primary" />
                )}
                {syncing ? "Sincronizando…" : "Sincronizar pagamento"}
              </span>
              <span className="text-muted-foreground">→</span>
            </button>
            <p className="px-1 text-[11px] text-muted-foreground">
              Use após pagar no Asaas se a assinatura ainda não apareceu aqui.
              A configuração é validada automaticamente antes da sincronização.
            </p>
            <Link
              to="/planos"
              className="w-full flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5 text-sm hover:bg-surface"
            >
              <span className="flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4 text-success" /> Fazer upgrade
              </span>
              <span className="text-muted-foreground">→</span>
            </Link>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5 text-sm hover:bg-surface"
            >
              <span className="flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 text-info" /> Fazer downgrade
              </span>
              <span className="text-muted-foreground">→</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5 text-sm hover:bg-surface"
            >
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" /> Alterar forma de pagamento
              </span>
              <span className="text-muted-foreground">→</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-2 rounded-md border border-destructive/30 px-3 py-2.5 text-sm hover:bg-destructive/10 text-destructive"
            >
              <span className="flex items-center gap-2">
                <XCircle className="h-4 w-4" /> Cancelar assinatura
              </span>
              <span>→</span>
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function UsageCard({
  label,
  used,
  limit,
  pct,
  icon: Icon,
  unit,
}: {
  label: string;
  used: number;
  limit: number;
  pct: number;
  icon: ComponentType<{ className?: string }>;
  unit: string;
}) {
  const tone = pct >= 90 ? "destructive" : pct >= 75 ? "warning" : "success";
  const colorClass =
    tone === "destructive" ? "bg-destructive" : tone === "warning" ? "bg-warning" : "bg-success";
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="font-display text-2xl font-bold mt-2">
        {used}
        {unit && ` ${unit}`}
        <span className="text-sm text-muted-foreground">
          {" "}
          / {limit >= 9999 ? "∞" : `${limit}${unit && ` ${unit}`}`}
        </span>
      </p>
      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${colorClass}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{Math.round(pct)}% utilizado</p>
    </div>
  );
}

function AsaasConfigCheck({
  validation,
  validating,
  onValidate,
}: {
  validation: AsaasValidationResult | null;
  validating: boolean;
  onValidate: () => void;
}) {
  let Icon: ComponentType<{ className?: string }> = ShieldQuestion;
  let tone = "border-border bg-muted/30 text-muted-foreground";
  let title = "Configuração Asaas não verificada";
  let detail = "Clique em “Validar” para checar ASAAS_API_KEY e ASAAS_API_BASE.";

  if (validating) {
    Icon = Loader2;
    tone = "border-primary/30 bg-primary/5 text-foreground";
    title = "Validando configuração…";
    detail = "Consultando Asaas com as credenciais atuais.";
  } else if (validation) {
    if (validation.ok) {
      Icon = ShieldCheck;
      tone = "border-success/40 bg-success/10 text-foreground";
      title = `Configuração Asaas OK — ambiente ${validation.environment}`;
      detail = `${validation.base_url}${validation.account ? ` · conta: ${validation.account}` : ""}`;
    } else {
      Icon = ShieldAlert;
      tone = "border-destructive/40 bg-destructive/10 text-foreground";
      title = `Configuração inválida — ambiente ${validation.environment}`;
      detail = validation.message;
    }
  }

  return (
    <div className={`rounded-md border ${tone} px-3 py-2.5`}>
      <div className="flex items-start gap-2">
        <Icon className={`h-4 w-4 mt-0.5 ${validating ? "animate-spin text-primary" : ""}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground break-words">{detail}</p>
          {validation && !validating && (
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
              <dt>Base URL</dt>
              <dd className="font-mono break-all">{validation.base_url || "—"}</dd>
              <dt>Origem</dt>
              <dd className="font-mono">{validation.base_url_source ?? "—"}</dd>
              <dt>API Key</dt>
              <dd className="font-mono">
                {validation.key_set ? (validation.key_prefix ?? "definida") : "não definida"}
              </dd>
              {validation.suggested_base_url && (
                <>
                  <dt>Sugestão</dt>
                  <dd className="font-mono break-all text-warning">
                    ASAAS_API_BASE = {validation.suggested_base_url}
                  </dd>
                </>
              )}
            </dl>
          )}
        </div>
        <button
          type="button"
          onClick={onValidate}
          disabled={validating}
          className="shrink-0 text-[11px] rounded border border-border bg-background px-2 py-1 hover:bg-surface disabled:opacity-60"
        >
          {validating ? "…" : "Validar"}
        </button>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  getSaasDiagnostics,
  promoteSelfToSuperAdmin,
  type SaasDiagnosticsResult,
} from "@/lib/server/saas-admin.functions";

export const Route = createFileRoute("/admin-saas/diagnostico")({
  head: () => ({ meta: [{ title: "Diagnóstico — SaaS SigPlayer" }] }),
  component: DiagnosticoPage,
});

async function withAuthHeader<T>(call: () => Promise<T>): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sem sessão. Faça login novamente.");
  // Server functions herdam Authorization se o cliente já o anexa nas requisições;
  // aqui usamos fetch direto para garantir o header.
  const original = window.fetch;
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers ?? {});
    if (!headers.has("authorization")) headers.set("authorization", `Bearer ${token}`);
    return original(input, { ...init, headers });
  }) as typeof window.fetch;
  try {
    return await call();
  } finally {
    window.fetch = original;
  }
}

function DiagnosticoPage() {
  const { user, refreshProfile } = useAuth();
  const [data, setData] = useState<SaasDiagnosticsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoting, setPromoting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await withAuthHeader(() => getSaasDiagnostics());
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar diagnóstico.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handlePromote = async () => {
    setPromoting(true);
    try {
      await withAuthHeader(() => promoteSelfToSuperAdmin());
      toast.success("Usuário promovido a super_admin.");
      await refreshProfile();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao promover usuário.");
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diagnóstico do painel SaaS"
        subtitle="Verifica seu papel na plataforma e a saúde das tabelas que alimentam /admin-saas."
        actions={
          <button
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface transition-smooth disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Recarregar
          </button>
        }
      />

      {loading && !data ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Panel>
          <div className="flex items-start gap-2 text-destructive">
            <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Falha no diagnóstico</p>
              <p className="text-sm mt-1">{error}</p>
              <p className="text-xs mt-2 text-muted-foreground">
                Verifique se <code>SERVICE_ROLE_KEY</code> está configurada nas variáveis do
                servidor.
              </p>
            </div>
          </div>
        </Panel>
      ) : data ? (
        <>
          <Panel title="Sessão atual">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Field label="User ID" value={data.user.id} mono />
              <Field label="E-mail" value={data.user.email ?? "—"} />
              <Field label="Profile ID" value={data.profile?.id ?? "—"} mono />
              <Field label="Organization ID" value={data.profile?.organization_id ?? "—"} mono />
              <Field label="profiles.role" value={data.profile?.role ?? "—"} />
              <Field
                label="É super_admin?"
                value={
                  data.isSuperAdmin ? (
                    <StatusBadge tone="success" label="Sim" withDot={false} />
                  ) : (
                    <StatusBadge tone="warning" label="Não" withDot={false} />
                  )
                }
              />
            </dl>

            {!data.isSuperAdmin && (
              <div className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Você ainda não é super_admin</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sem este papel as páginas <code>/admin-saas</code> exibem estados vazios
                      porque as RLS bloqueiam SELECTs. Clique abaixo para se promover usando a
                      service role no servidor.
                    </p>
                    <button
                      onClick={handlePromote}
                      disabled={promoting}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
                    >
                      {promoting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      )}
                      Promover-me a super_admin
                    </button>
                  </div>
                </div>
              </div>
            )}

            {data.isSuperAdmin && (
              <div className="mt-4 rounded-lg border border-success/30 bg-success/5 p-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">
                  Tudo certo — seu usuário tem acesso total ao painel SaaS.
                </span>
              </div>
            )}
          </Panel>

          <Panel title="Saúde das tabelas SaaS">
            <p className="text-xs text-muted-foreground mb-3">
              Contagem real (via service role, sem RLS). Se algum valor for <code>0</code>, as
              páginas correspondentes vão mostrar estados vazios — popule a base ou rode as seeds.
            </p>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-5 py-2 font-medium">Tabela</th>
                    <th className="px-3 py-2 font-medium">Registros</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(data.counts).map(([table, value]) => {
                    const isError = typeof value === "object";
                    const count = isError ? null : (value as number);
                    return (
                      <tr key={table} className="hover:bg-surface/50">
                        <td className="px-5 py-2.5 font-mono text-xs">{table}</td>
                        <td className="px-3 py-2.5 font-mono">{isError ? "—" : count}</td>
                        <td className="px-3 py-2.5">
                          {isError ? (
                            <span className="inline-flex items-center gap-1 text-destructive text-xs">
                              <XCircle className="h-3.5 w-3.5" />
                              {(value as { error: string }).error}
                            </span>
                          ) : count === 0 ? (
                            <StatusBadge tone="warning" label="Vazia" withDot={false} />
                          ) : (
                            <StatusBadge tone="success" label="OK" withDot={false} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Amostras (até 2 linhas por tabela)">
            <div className="space-y-3">
              {Object.entries(data.samples).map(([table, rows]) => (
                <details key={table} className="rounded-md border border-border bg-surface/30">
                  <summary className="cursor-pointer px-3 py-2 text-xs font-mono flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {table}{" "}
                    <span className="text-muted-foreground">({(rows as unknown[]).length})</span>
                  </summary>
                  <pre className="text-[11px] overflow-x-auto p-3 border-t border-border bg-background/50">
                    {JSON.stringify(rows, null, 2)}
                  </pre>
                </details>
              ))}
            </div>
          </Panel>
        </>
      ) : null}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-surface/30 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 text-sm ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</dd>
    </div>
  );
}

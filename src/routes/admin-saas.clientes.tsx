import { createFileRoute } from "@tanstack/react-router";
import { Building2, Search, Eye, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { useSaasDirectory } from "@/lib/hooks/use-saas-data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/admin-saas/clientes")({
  head: () => ({ meta: [{ title: "Clientes — SaaS Signix" }] }),
  component: ClientesPage,
});

function ClientesPage() {
  const [q, setQ] = useState("");
  const { data: clients = [], isLoading } = useSaasDirectory();

  const filtered = useMemo(
    () =>
      clients.filter(
        (c) =>
          c.organization_name.toLowerCase().includes(q.toLowerCase()) ||
          (c.master_email ?? "").toLowerCase().includes(q.toLowerCase()),
      ),
    [clients, q],
  );

  if (isLoading && clients.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Clientes" subtitle="Empresas que assinaram a plataforma." />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" subtitle="Empresas que assinaram a plataforma." />

      <Panel
        title={`${filtered.length} empresas`}
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 w-72 max-w-full">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar empresa ou email…"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        }
      >
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-5 py-2 font-medium">Empresa</th>
                <th className="px-3 py-2 font-medium">Master</th>
                <th className="px-3 py-2 font-medium">Plano</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Telas</th>
                <th className="px-3 py-2 font-medium">Licença</th>
                <th className="px-3 py-2 font-medium">Cadastro</th>
                <th className="px-3 py-2 font-medium">Último pagamento</th>
                <th className="px-5 py-2 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.organization_id} className="hover:bg-surface/50 transition-smooth">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-md bg-primary/10 grid place-items-center text-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{c.organization_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground text-xs">
                      {c.master_email ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-medium">{c.plan_name ?? "—"}</span>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge
                        tone={
                          c.subscription_status === "active"
                            ? "success"
                            : c.subscription_status === "trialing"
                              ? "info"
                              : c.subscription_status === "past_due"
                                ? "warning"
                                : "destructive"
                        }
                        label={c.subscription_status ?? "—"}
                        withDot={false}
                      />
                    </td>
                    <td className="px-3 py-3 text-xs font-mono">
                      {c.screens_used}/{c.screens_limit >= 9999 ? "∞" : c.screens_limit}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge
                        tone={
                          c.license_status === "active"
                            ? "success"
                            : c.license_status === "trial"
                              ? "info"
                              : c.license_status === "suspended"
                                ? "warning"
                                : "destructive"
                        }
                        label={c.license_status ?? "—"}
                        withDot={false}
                      />
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {format(new Date(c.created_at), "dd/MM/yy", { locale: ptBR })}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {c.last_payment_at
                        ? format(new Date(c.last_payment_at), "dd/MM/yy", { locale: ptBR })
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-surface"
                      >
                        <Eye className="h-3 w-3" /> Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

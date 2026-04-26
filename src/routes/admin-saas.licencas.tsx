import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { useSaaSLicensesList } from "@/lib/hooks/use-saas-data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/admin-saas/licencas")({
  head: () => ({ meta: [{ title: "Licenças — SaaS Signix" }] }),
  component: LicencasPage,
});

function LicencasPage() {
  const { data: rows = [], isLoading } = useSaaSLicensesList();

  if (isLoading && rows.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Licenças" subtitle="Controle de chaves emitidas e validade." />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Licenças" subtitle="Controle de chaves emitidas e validade." />

      <Panel title={`${rows.length} licenças emitidas`}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-5 py-2 font-medium">Empresa</th>
                <th className="px-3 py-2 font-medium">Chave</th>
                <th className="px-3 py-2 font-medium">Plano</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Telas liberadas</th>
                <th className="px-3 py-2 font-medium">Válida desde</th>
                <th className="px-3 py-2 font-medium">Validade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma licença na base.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="hover:bg-surface/50">
                    <td className="px-5 py-3 font-medium">{c.org_name}</td>
                    <td className="px-3 py-3 font-mono text-[11px] break-all max-w-[200px]">
                      <span className="inline-flex items-center gap-1">
                        <KeyRound className="h-3 w-3 shrink-0 text-primary" />
                        {c.key || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs">{c.plan_name ?? "—"}</td>
                    <td className="px-3 py-3">
                      <StatusBadge
                        tone={
                          c.status === "active"
                            ? "success"
                            : c.status === "trial"
                              ? "info"
                              : c.status === "suspended"
                                ? "warning"
                                : "destructive"
                        }
                        label={c.status}
                        withDot={false}
                      />
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      {c.max_screens >= 9999 ? "∞" : c.max_screens}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {format(new Date(c.valid_from), "dd/MM/yy", { locale: ptBR })}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {c.valid_until
                        ? format(new Date(c.valid_until), "dd/MM/yy", { locale: ptBR })
                        : "—"}
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

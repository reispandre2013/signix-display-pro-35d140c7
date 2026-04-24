import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { MOCK_SAAS_CLIENTS } from "@/lib/saas-mock";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/admin-saas/licencas")({
  head: () => ({ meta: [{ title: "Licenças — SaaS Signix" }] }),
  component: LicencasPage,
});

function LicencasPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Licenças" subtitle="Controle de chaves emitidas e validade." />

      <Panel title={`${MOCK_SAAS_CLIENTS.length} licenças emitidas`}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-5 py-2 font-medium">Empresa</th>
                <th className="px-3 py-2 font-medium">Chave</th>
                <th className="px-3 py-2 font-medium">Plano</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Telas liberadas</th>
                <th className="px-3 py-2 font-medium">Validade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_SAAS_CLIENTS.map((c, i) => (
                <tr key={c.organization_id} className="hover:bg-surface/50">
                  <td className="px-5 py-3 font-medium">{c.organization_name}</td>
                  <td className="px-3 py-3 font-mono text-[11px] flex items-center gap-1">
                    <KeyRound className="h-3 w-3 text-primary" /> SGNX-{c.organization_id.toUpperCase()}-{1000 + i}
                  </td>
                  <td className="px-3 py-3 text-xs">{c.plan_name}</td>
                  <td className="px-3 py-3">
                    <StatusBadge
                      tone={c.license_status === "active" ? "success"
                        : c.license_status === "trial" ? "info"
                        : c.license_status === "suspended" ? "warning"
                        : "destructive"}
                      label={c.license_status ?? "—"}
                      withDot={false}
                    />
                  </td>
                  <td className="px-3 py-3 font-mono text-xs">{c.screens_limit >= 9999 ? "∞" : c.screens_limit}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {format(new Date(new Date(c.created_at).getTime() + 365 * 86400000), "dd/MM/yy", { locale: ptBR })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listPendingAndroidDevices,
  activateAndroidDevice,
  type PendingAndroidDevice,
} from "@/lib/server/android-devices.functions";
import { withAuthHeader } from "@/lib/server/with-auth-header";
import { useOrganizations, useUnits } from "@/lib/hooks/use-supabase-data";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui-kit/States";
import { Tv, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/dispositivos-pendentes")({
  head: () => ({ meta: [{ title: "Dispositivos pendentes — SigPlayer" }] }),
  component: PendingDevicesPage,
});

function PendingDevicesPage() {
  const listFn = useServerFn(listPendingAndroidDevices);
  const activateFn = useServerFn(activateAndroidDevice);
  const qc = useQueryClient();
  const orgsQ = useOrganizations();
  const unitsQ = useUnits();

  const q = useQuery({
    queryKey: ["pending-android-devices"],
    queryFn: () => withAuthHeader(() => listFn({ data: undefined as never })),
    refetchInterval: 10_000,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispositivos pendentes (Android TV)"
        subtitle="APKs auto-registrados aguardando ativação. Defina nome e organização para liberar."
        actions={
          <button
            onClick={() => q.refetch()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
        }
      />

      {q.isLoading ? (
        <LoadingState />
      ) : q.error ? (
        <ErrorState error={q.error} />
      ) : (q.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="Nenhum dispositivo pendente"
          description="Instale o APK na TV; o aparelho aparecerá aqui automaticamente."
          icon={Tv}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.data!.map((d) => (
            <PendingCard
              key={d.id}
              device={d}
              orgs={(orgsQ.data ?? []) as Array<{ id: string; name: string }>}
              units={(unitsQ.data ?? []) as Array<{ id: string; name: string }>}
              onActivate={async (payload) => {
                try {
                  await withAuthHeader(() =>
                    activateFn({ data: { ...payload, device_id: d.id } }),
                  );
                  toast.success("Dispositivo ativado.");
                  qc.invalidateQueries({ queryKey: ["pending-android-devices"] });
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Falha ao ativar.");
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PendingCard({
  device,
  orgs,
  units,
  onActivate,
}: {
  device: PendingAndroidDevice;
  orgs: Array<{ id: string; name: string }>;
  units: Array<{ id: string; name: string }>;
  onActivate: (p: { device_name: string; organization_id: string; unit_id: string | null }) => Promise<void>;
}) {
  const [name, setName] = useState(device.device_name ?? device.tv_model ?? "Android TV");
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? "");
  const [unitId, setUnitId] = useState<string>("");
  const [busy, setBusy] = useState(false);

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary">
          <Tv className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">
            {device.tv_model ?? "Android TV"}{" "}
            <span className="text-xs text-muted-foreground">{device.manufacturer ?? ""}</span>
          </div>
          <div className="text-[11px] text-muted-foreground font-mono truncate">
            UUID {device.device_uuid.slice(0, 12)}… · v{device.app_version ?? "?"}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <label className="block text-[11px] uppercase tracking-wider text-muted-foreground">
          Nome do dispositivo
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
        />
        <label className="block text-[11px] uppercase tracking-wider text-muted-foreground">
          Organização
        </label>
        <select
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
        >
          <option value="">— escolher —</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <label className="block text-[11px] uppercase tracking-wider text-muted-foreground">
          Unidade (opcional)
        </label>
        <select
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
        >
          <option value="">— sem unidade —</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        disabled={busy || !name.trim() || !orgId}
        onClick={async () => {
          setBusy(true);
          await onActivate({
            device_name: name.trim(),
            organization_id: orgId,
            unit_id: unitId || null,
          });
          setBusy(false);
        }}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
      >
        <Check className="h-3.5 w-3.5" /> {busy ? "Ativando…" : "Ativar dispositivo"}
      </button>
    </article>
  );
}

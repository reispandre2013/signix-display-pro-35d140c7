import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Star, Plus, Loader2, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { useAdminPlansCatalog } from "@/lib/hooks/use-saas-data";
import { upsertPlan, deletePlan } from "@/lib/server/saas-admin.functions";
import { withAuthHeader } from "@/lib/server/with-auth-header";
import { formatPrice, type Plan } from "@/types/saas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin-saas/planos")({
  head: () => ({ meta: [{ title: "Planos — SaaS Signix" }] }),
  component: PlanosPage,
});

type FormState = {
  id?: string;
  code: string;
  name: string;
  description: string;
  price_monthly_cents: number;
  price_yearly_cents: number;
  currency: string;
  max_screens: number;
  max_users: number;
  max_storage_gb: number;
  features: string; // textarea (uma feature por linha)
  support_level: string;
  is_recommended: boolean;
  is_active: boolean;
  sort_order: number;
};

const EMPTY: FormState = {
  code: "",
  name: "",
  description: "",
  price_monthly_cents: 0,
  price_yearly_cents: 0,
  currency: "BRL",
  max_screens: 1,
  max_users: 1,
  max_storage_gb: 1,
  features: "",
  support_level: "email",
  is_recommended: false,
  is_active: true,
  sort_order: 0,
};

function planToForm(p: Plan): FormState {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description ?? "",
    price_monthly_cents: p.price_monthly_cents,
    price_yearly_cents: p.price_yearly_cents,
    currency: p.currency,
    max_screens: p.max_screens,
    max_users: p.max_users,
    max_storage_gb: p.max_storage_gb,
    features: (p.features ?? []).join("\n"),
    support_level: p.support_level ?? "",
    is_recommended: p.is_recommended,
    is_active: p.is_active,
    sort_order: p.sort_order,
  };
}

function PlanosPage() {
  const { data: plans = [], isLoading, isError, error } = useAdminPlansCatalog();
  const [editing, setEditing] = useState<FormState | null>(null);
  const queryClient = useQueryClient();

  const upsertFn = useServerFn(upsertPlan);
  const deleteFn = useServerFn(deletePlan);

  const saveMutation = useMutation({
    mutationFn: async (form: FormState) => {
      return withAuthHeader(() =>
        upsertFn({
          data: {
            id: form.id ?? null,
            code: form.code,
            name: form.name,
            description: form.description || null,
            price_monthly_cents: form.price_monthly_cents,
            price_yearly_cents: form.price_yearly_cents,
            currency: form.currency || "BRL",
            max_screens: form.max_screens,
            max_users: form.max_users,
            max_storage_gb: form.max_storage_gb,
            features: form.features
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            support_level: form.support_level || null,
            is_recommended: form.is_recommended,
            is_active: form.is_active,
            sort_order: form.sort_order,
          },
        }),
      );
    },
    onSuccess: () => {
      toast.success("Plano salvo com sucesso");
      queryClient.invalidateQueries({ queryKey: ["saas", "plans"] });
      setEditing(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar plano");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => withAuthHeader(() => deleteFn({ data: { id } })),
    onSuccess: () => {
      toast.success("Plano removido");
      queryClient.invalidateQueries({ queryKey: ["saas", "plans"] });
      setEditing(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Falha ao remover plano");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Planos" subtitle="Catálogo de planos comerciais oferecidos no SaaS." />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Planos" subtitle="Catálogo de planos comerciais oferecidos no SaaS." />
        <Panel>
          <p className="text-sm text-destructive">{error instanceof Error ? error.message : "Falha ao carregar planos."}</p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planos"
        subtitle="Catálogo de planos comerciais oferecidos no SaaS."
        actions={
          <button
            type="button"
            onClick={() => setEditing({ ...EMPTY, sort_order: plans.length })}
            className="inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow"
          >
            <Plus className="h-3.5 w-3.5" /> Novo plano
          </button>
        }
      />

      {plans.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Nenhum plano na base. Clique em <strong>Novo plano</strong> para criar o primeiro.
          </p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((p) => (
            <Panel key={p.id} className={cn(p.is_recommended && "ring-2 ring-primary shadow-glow")}>
              <div>
                {p.is_recommended && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider mb-2">
                    <Star className="h-3 w-3" /> Recomendado
                  </span>
                )}
                <h3 className="font-display text-xl font-bold">{p.name}</h3>
                {p.is_active ? null : (
                  <span className="ml-2 text-[10px] font-semibold uppercase text-muted-foreground">Inativo</span>
                )}
                <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                <div className="mt-4">
                  <span className="font-display text-3xl font-bold">{formatPrice(p.price_monthly_cents)}</span>
                  <span className="text-xs text-muted-foreground">/mês</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">ou {formatPrice(p.price_yearly_cents)} /ano</p>

                <ul className="mt-4 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground border-t border-border pt-3">
                  <div>
                    <div className="font-bold text-foreground text-sm">{p.max_screens >= 9999 ? "∞" : p.max_screens}</div>
                    telas
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{p.max_users >= 9999 ? "∞" : p.max_users}</div>
                    users
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{p.max_storage_gb}GB</div>
                    storage
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditing(planToForm(p))}
                  className="mt-4 w-full rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface transition-smooth"
                >
                  Editar plano
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {editing && (
        <PlanEditor
          form={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={() => saveMutation.mutate(editing)}
          onDelete={editing.id ? () => deleteMutation.mutate(editing.id!) : undefined}
          saving={saveMutation.isPending}
          deleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

function PlanEditor({
  form,
  onChange,
  onClose,
  onSave,
  onDelete,
  saving,
  deleting,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
  saving: boolean;
  deleting: boolean;
}) {
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => onChange({ ...form, [k]: v });
  const isEdit = !!form.id;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold">
            {isEdit ? `Editar plano: ${form.name || form.code}` : "Novo plano"}
          </h3>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
            Fechar
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Código *">
              <Input value={form.code} onChange={(v) => set("code", v)} placeholder="starter" required />
            </Field>
            <Field label="Nome *">
              <Input value={form.name} onChange={(v) => set("name", v)} placeholder="Starter" required />
            </Field>
          </div>

          <Field label="Descrição">
            <Input value={form.description} onChange={(v) => set("description", v)} placeholder="Para começar" />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Preço mensal (centavos)">
              <NumberInput value={form.price_monthly_cents} onChange={(v) => set("price_monthly_cents", v)} />
            </Field>
            <Field label="Preço anual (centavos)">
              <NumberInput value={form.price_yearly_cents} onChange={(v) => set("price_yearly_cents", v)} />
            </Field>
            <Field label="Moeda">
              <Input value={form.currency} onChange={(v) => set("currency", v)} placeholder="BRL" />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Máx. telas">
              <NumberInput value={form.max_screens} onChange={(v) => set("max_screens", v)} />
            </Field>
            <Field label="Máx. usuários">
              <NumberInput value={form.max_users} onChange={(v) => set("max_users", v)} />
            </Field>
            <Field label="Storage (MB)">
              <div className="relative">
                <NumberInput value={form.max_storage_gb} onChange={(v) => set("max_storage_gb", v)} />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                  GB
                </span>
              </div>
            </Field>
          </div>

          <Field label="Funcionalidades (uma por linha)">
            <textarea
              value={form.features}
              onChange={(e) => set("features", e.target.value)}
              className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]"
              placeholder={"Suporte por e-mail\nRelatórios básicos\nAté 3 telas"}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nível de suporte">
              <Input
                value={form.support_level}
                onChange={(v) => set("support_level", v)}
                placeholder="email | chat | priority"
              />
            </Field>
            <Field label="Ordem (sort_order)">
              <NumberInput value={form.sort_order} onChange={(v) => set("sort_order", v)} />
            </Field>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => set("is_active", e.target.checked)}
              />
              Ativo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_recommended}
                onChange={(e) => set("is_recommended", e.target.checked)}
              />
              Recomendado
            </label>
          </div>

          <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
            <div>
              {isEdit && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Remover este plano? Esta ação não pode ser desfeita.")) onDelete();
                  }}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
                >
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Remover
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isEdit ? "Salvar alterações" : "Criar plano"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

function NumberInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

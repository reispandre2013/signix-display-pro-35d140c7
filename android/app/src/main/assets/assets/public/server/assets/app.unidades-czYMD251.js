import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { P as PageHeader } from "./PageHeader-Dkx9-OAF.js";
import { S as StatusBadge } from "./StatusBadge-CQeJIG5P.js";
import { L as LoadingState, a as ErrorState, E as EmptyState } from "./States-BZKT3Fib.js";
import { u as useModalForm, P as PrimaryButton, M as Modal, F as FormField, T as TextInput } from "./FormControls-5gujQwST.js";
import { g as useUnits, h as useCreateUnit, i as useDeleteUnit } from "./use-supabase-data-DWtjSxP7.js";
import { t as toast } from "./router-BfC5KUx0.js";
import { P as Plus } from "./plus-BVWsQpQr.js";
import { B as Building2 } from "./building-2-DAzKcuho.js";
import { M as MapPin } from "./map-pin-BaN5Ohl6.js";
import { T as Trash2 } from "./trash-2-B6pEYlNh.js";
import { U as User } from "./user-BVQ1qz6K.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-Bz4m9VPB.js";
import "./loader-circle-DWZmQ-AH.js";
import "./x-Vv-VrOr6.js";
import "./index-Cf78ubZ7.js";
const __iconNode = [
  [
    "path",
    {
      d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
      key: "9njp5v"
    }
  ]
];
const Phone = createLucideIcon("phone", __iconNode);
function UnitsPage() {
  const unitsQ = useUnits();
  const create = useCreateUnit();
  const del = useDeleteUnit();
  const form = useModalForm({
    name: "",
    address: "",
    city: "",
    state: "",
    manager_name: "",
    manager_phone: ""
  });
  const [submitting, setSubmitting] = reactExports.useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.values.name) return toast.error("Informe o nome.");
    setSubmitting(true);
    try {
      await create.mutateAsync(form.values);
      toast.success("Unidade criada.");
      form.reset();
      form.setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id, name) => {
    if (!confirm(`Excluir unidade "${name}"?`)) return;
    try {
      await del.mutateAsync(id);
      toast.success("Excluída.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Unidades / Locais", subtitle: "Locais físicos onde as telas estão instaladas.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => form.setOpen(true), className: "inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
      " Nova unidade"
    ] }) }),
    unitsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingState, {}) : unitsQ.error ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error: unitsQ.error }) : (unitsQ.data?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "Nenhuma unidade cadastrada", description: "Cadastre filiais, lojas ou pontos de exibição para organizar suas telas.", icon: Building2, action: /* @__PURE__ */ jsxRuntimeExports.jsxs(PrimaryButton, { onClick: () => form.setOpen(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
      " Criar primeira unidade"
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: unitsQ.data.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-xl border border-border bg-card p-5 shadow-card hover:border-primary/40 transition-smooth", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-lg bg-primary/10 grid place-items-center text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(u.id, u.name), className: "h-7 w-7 grid place-items-center rounded-md hover:bg-destructive/10 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-semibold mt-3", children: u.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
        u.address ?? "—",
        " ",
        u.city && `· ${u.city}`,
        u.state && `/${u.state}`
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-2 text-[11px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-surface/50 px-2.5 py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
            " Responsável"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium mt-0.5 truncate", children: u.manager_name ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-surface/50 px-2.5 py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
            " Telefone"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium mt-0.5 truncate", children: u.manager_phone ?? "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 pt-4 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { tone: u.status === "active" ? "success" : "neutral", label: u.status }) })
    ] }, u.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { open: form.open, onClose: () => form.setOpen(false), title: "Nova unidade", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Nome *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.values.name, onChange: (e) => form.set("name", e.target.value), required: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Endereço", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.values.address, onChange: (e) => form.set("address", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Cidade", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.values.city, onChange: (e) => form.set("city", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Estado (UF)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { maxLength: 2, value: form.values.state, onChange: (e) => form.set("state", e.target.value.toUpperCase()) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Responsável", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.values.manager_name, onChange: (e) => form.set("manager_name", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Telefone", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.values.manager_phone, onChange: (e) => form.set("manager_phone", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => form.setOpen(false), className: "rounded-md border border-border px-3 py-2 text-xs", children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PrimaryButton, { type: "submit", disabled: submitting, children: submitting ? "Salvando…" : "Criar unidade" })
      ] })
    ] }) })
  ] });
}
export {
  UnitsPage as component
};

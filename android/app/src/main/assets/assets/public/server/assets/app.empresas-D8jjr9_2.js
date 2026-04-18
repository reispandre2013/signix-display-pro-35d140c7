import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { P as PageHeader } from "./PageHeader-Dkx9-OAF.js";
import { P as Panel } from "./Panel-iDal3y1F.js";
import { L as LoadingState, a as ErrorState } from "./States-BZKT3Fib.js";
import { r as useOrganization, f as useMutation } from "./use-supabase-data-DWtjSxP7.js";
import { b as useQueryClient, s as supabase } from "./router-BfC5KUx0.js";
import { B as Building2 } from "./building-2-DAzKcuho.js";
import { G as Globe } from "./globe-CZTrqLgi.js";
import { S as Save } from "./save-C1iXSk30.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-Bz4m9VPB.js";
import "./loader-circle-DWZmQ-AH.js";
import "./createLucideIcon-DUXbX0Xj.js";
import "./index-Cf78ubZ7.js";
function CompaniesPage() {
  const {
    data: org,
    isLoading,
    error
  } = useOrganization();
  const qc = useQueryClient();
  const [form, setForm] = reactExports.useState({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    timezone: "America/Sao_Paulo",
    language: "pt-BR"
  });
  reactExports.useEffect(() => {
    if (org) {
      setForm({
        name: org.name ?? "",
        cnpj: org.cnpj ?? "",
        email: org.email ?? "",
        phone: org.phone ?? "",
        address: org.address ?? "",
        city: org.city ?? "",
        state: org.state ?? "",
        timezone: org.timezone ?? "America/Sao_Paulo",
        language: org.language ?? "pt-BR"
      });
    }
  }, [org]);
  const save = useMutation({
    mutationFn: async () => {
      if (!org) throw new Error("Organização não carregada.");
      const {
        error: error2
      } = await supabase.from("organizations").update(form).eq("id", org.id);
      if (error2) throw error2;
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["organization"]
    })
  });
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingState, {});
  if (error) return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Empresa / Organização", subtitle: "Dados da sua organização e identidade visual." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Identidade", className: "lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 w-24 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-10 w-10 text-primary-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 font-display text-lg font-bold", children: form.name || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: form.cnpj || "Sem CNPJ" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Dados cadastrais", className: "lg:col-span-2", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => save.mutate(), disabled: save.isPending, className: "inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5" }),
        " ",
        save.isPending ? "Salvando…" : "Salvar"
      ] }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nome da empresa", value: form.name, onChange: (v) => setForm({
            ...form,
            name: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "CNPJ", value: form.cnpj, onChange: (v) => setForm({
            ...form,
            cnpj: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "E-mail corporativo", value: form.email, onChange: (v) => setForm({
            ...form,
            email: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Telefone", value: form.phone, onChange: (v) => setForm({
            ...form,
            phone: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Endereço", value: form.address, onChange: (v) => setForm({
            ...form,
            address: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Cidade", value: form.city, onChange: (v) => setForm({
            ...form,
            city: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Estado", value: form.state, onChange: (v) => setForm({
            ...form,
            state: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Idioma", value: form.language, onChange: (v) => setForm({
            ...form,
            language: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1.5 block", children: "Fuso horário" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.timezone, onChange: (e) => setForm({
                ...form,
                timezone: e.target.value
              }), className: "w-full rounded-lg border border-input bg-surface pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" })
            ] })
          ] })
        ] }),
        save.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-xs text-destructive", children: [
          "Erro: ",
          save.error.message
        ] })
      ] })
    ] })
  ] });
}
function Field({
  label,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1.5 block", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value, onChange: (e) => onChange(e.target.value), className: "w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" })
  ] });
}
export {
  CompaniesPage as component
};

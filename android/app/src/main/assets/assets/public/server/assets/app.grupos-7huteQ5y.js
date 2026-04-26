import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { P as PageHeader } from "./PageHeader-Dkx9-OAF.js";
import { P as Panel } from "./Panel-iDal3y1F.js";
import { S as StatusBadge } from "./StatusBadge-CQeJIG5P.js";
import { L as LoadingState, a as ErrorState, E as EmptyState } from "./States-BZKT3Fib.js";
import {
  P as PrimaryButton,
  M as Modal,
  F as FormField,
  T as TextInput,
  a as TextArea,
} from "./FormControls-5gujQwST.js";
import {
  o as useScreenGroups,
  p as useCreateScreenGroup,
  q as useDeleteScreenGroup,
} from "./use-supabase-data-DWtjSxP7.js";
import { P as Plus } from "./plus-BVWsQpQr.js";
import { L as Layers } from "./layers-56A3WZ9s.js";
import { T as Trash2 } from "./trash-2-B6pEYlNh.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-Bz4m9VPB.js";
import "./loader-circle-DWZmQ-AH.js";
import "./createLucideIcon-DUXbX0Xj.js";
import "./x-Vv-VrOr6.js";
import "./router-BfC5KUx0.js";
import "./index-Cf78ubZ7.js";
function GroupsPage() {
  const { data: groups = [], isLoading, error } = useScreenGroups();
  const create = useCreateScreenGroup();
  const remove = useDeleteScreenGroup();
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    name: "",
    description: "",
  });
  const submit = async (e) => {
    e.preventDefault();
    await create.mutateAsync({
      name: form.name,
      description: form.description,
      status: "active",
    });
    setOpen(false);
    setForm({
      name: "",
      description: "",
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "space-y-6",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, {
        title: "Grupos de telas",
        subtitle: "Agrupe telas por finalidade para distribuir campanhas em massa.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(PrimaryButton, {
          onClick: () => setOpen(true),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
            " Novo grupo",
          ],
        }),
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, {
        bodyClassName: "p-0",
        children: isLoading
          ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingState, {})
          : error
            ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error })
            : groups.length === 0
              ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, {
                  icon: Layers,
                  title: "Nenhum grupo criado",
                  description: "Crie grupos para enviar campanhas para múltiplas telas de uma vez.",
                  action: /* @__PURE__ */ jsxRuntimeExports.jsxs(PrimaryButton, {
                    onClick: () => setOpen(true),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
                      " Novo grupo",
                    ],
                  }),
                })
              : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", {
                  className: "w-full text-sm",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", {
                      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", {
                        className:
                          "border-b border-border bg-surface/50 text-[11px] uppercase tracking-wider text-muted-foreground",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("th", {
                            className: "px-5 py-3 text-left",
                            children: "Grupo",
                          }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("th", {
                            className: "px-5 py-3 text-left",
                            children: "Descrição",
                          }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("th", {
                            className: "px-5 py-3 text-left",
                            children: "Status",
                          }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("th", {
                            className: "px-5 py-3 w-10",
                          }),
                        ],
                      }),
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", {
                      children: groups.map((g) =>
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "tr",
                          {
                            className: "border-b border-border/50 hover:bg-surface/40",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("td", {
                                className: "px-5 py-3.5",
                                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                                  className: "flex items-center gap-2.5",
                                  children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                                      className:
                                        "h-8 w-8 rounded-md bg-primary/10 grid place-items-center text-primary",
                                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, {
                                        className: "h-4 w-4",
                                      }),
                                    }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                                      className: "font-medium",
                                      children: g.name,
                                    }),
                                  ],
                                }),
                              }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("td", {
                                className: "px-5 py-3.5 text-muted-foreground",
                                children: g.description ?? "—",
                              }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("td", {
                                className: "px-5 py-3.5",
                                children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, {
                                  tone: g.status === "active" ? "success" : "neutral",
                                  label: g.status,
                                }),
                              }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("td", {
                                className: "px-5 py-3.5",
                                children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                                  onClick: () => confirm("Excluir grupo?") && remove.mutate(g.id),
                                  className: "text-muted-foreground hover:text-destructive",
                                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, {
                                    className: "h-4 w-4",
                                  }),
                                }),
                              }),
                            ],
                          },
                          g.id,
                        ),
                      ),
                    }),
                  ],
                }),
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, {
        open,
        onClose: () => setOpen(false),
        title: "Novo grupo de telas",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
          onSubmit: submit,
          className: "space-y-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, {
              label: "Nome",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, {
                required: true,
                value: form.name,
                onChange: (e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  }),
              }),
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, {
              label: "Descrição",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextArea, {
                value: form.description,
                onChange: (e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  }),
              }),
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PrimaryButton, {
              type: "submit",
              disabled: create.isPending,
              children: create.isPending ? "Salvando…" : "Criar grupo",
            }),
          ],
        }),
      }),
    ],
  });
}
export { GroupsPage as component };

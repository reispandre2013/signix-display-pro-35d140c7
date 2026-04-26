import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { L as Link } from "./router-BfC5KUx0.js";
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
  d as usePlaylists,
  k as useCreatePlaylist,
  l as useDeletePlaylist,
} from "./use-supabase-data-DWtjSxP7.js";
import { P as Plus } from "./plus-BVWsQpQr.js";
import { L as ListVideo } from "./list-video-B8g0xPnR.js";
import { E as Eye } from "./eye-B03_hUEz.js";
import { T as Trash2 } from "./trash-2-B6pEYlNh.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.js";
import "./utils-Bz4m9VPB.js";
import "./loader-circle-DWZmQ-AH.js";
import "./createLucideIcon-DUXbX0Xj.js";
import "./x-Vv-VrOr6.js";
function PlaylistsPage() {
  const { data: playlists = [], isLoading, error } = usePlaylists();
  const create = useCreatePlaylist();
  const remove = useDeletePlaylist();
  const [open, setOpen] = reactExports.useState(false);
  const [selected, setSelected] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    name: "",
    description: "",
  });
  const current = playlists.find((p) => p.id === (selected ?? playlists[0]?.id));
  const submit = async (e) => {
    e.preventDefault();
    await create.mutateAsync({
      name: form.name,
      description: form.description,
      status: "draft",
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
        title: "Playlists",
        subtitle: "Sequências de mídias prontas para serem usadas em campanhas.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(PrimaryButton, {
          onClick: () => setOpen(true),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
            " Nova playlist",
          ],
        }),
      }),
      isLoading
        ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingState, {})
        : error
          ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error })
          : playlists.length === 0
            ? /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, {
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, {
                  icon: ListVideo,
                  title: "Nenhuma playlist criada",
                  description: "Crie playlists para reutilizar em várias campanhas.",
                  action: /* @__PURE__ */ jsxRuntimeExports.jsxs(PrimaryButton, {
                    onClick: () => setOpen(true),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
                      " Nova playlist",
                    ],
                  }),
                }),
              })
            : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                    className: "lg:col-span-1 space-y-3",
                    children: playlists.map((p) => {
                      const active = current?.id === p.id;
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => setSelected(p.id),
                          className: `w-full text-left rounded-lg border ${active ? "border-primary/50 bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/30"} p-4 transition-smooth`,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                              className: "flex items-start justify-between gap-2",
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                                  className: "flex items-center gap-2",
                                  children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                                      className:
                                        "h-9 w-9 rounded-lg bg-gradient-primary grid place-items-center",
                                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListVideo, {
                                        className: "h-4 w-4 text-primary-foreground",
                                      }),
                                    }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                                      children: [
                                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                                          className: "font-medium text-sm",
                                          children: p.name,
                                        }),
                                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                                          className: "text-[11px] text-muted-foreground",
                                          children: p.status,
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, {
                                  tone: p.status === "active" ? "success" : "neutral",
                                  label: p.status,
                                  withDot: false,
                                }),
                              ],
                            }),
                            p.description &&
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                                className: "text-[11px] text-muted-foreground mt-2 line-clamp-2",
                                children: p.description,
                              }),
                          ],
                        },
                        p.id,
                      );
                    }),
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                    className: "lg:col-span-2",
                    children:
                      current &&
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, {
                        title: current.name,
                        description: current.description ?? "Sem descrição",
                        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          jsxRuntimeExports.Fragment,
                          {
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, {
                                to: "/app/preview",
                                className:
                                  "inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs hover:bg-accent",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, {
                                    className: "h-3.5 w-3.5",
                                  }),
                                  " Preview",
                                ],
                              }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", {
                                onClick: () =>
                                  confirm("Excluir playlist?") && remove.mutate(current.id),
                                className:
                                  "inline-flex items-center gap-1 rounded-md text-destructive hover:bg-destructive/10 px-2.5 py-1.5 text-xs",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, {
                                    className: "h-3.5 w-3.5",
                                  }),
                                  " Excluir",
                                ],
                              }),
                            ],
                          },
                        ),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, {
                          icon: ListVideo,
                          title: "Itens da playlist",
                          description:
                            "Em breve: arraste mídias da biblioteca para montar a sequência desta playlist.",
                        }),
                      }),
                  }),
                ],
              }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, {
        open,
        onClose: () => setOpen(false),
        title: "Nova playlist",
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
              children: create.isPending ? "Salvando…" : "Criar",
            }),
          ],
        }),
      }),
    ],
  });
}
export { PlaylistsPage as component };

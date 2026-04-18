import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { L as Link } from "./router-BfC5KUx0.js";
import { P as PageHeader } from "./PageHeader-Dkx9-OAF.js";
import { P as Panel } from "./Panel-iDal3y1F.js";
import { S as StatusBadge } from "./StatusBadge-CQeJIG5P.js";
import { L as LoadingState, a as ErrorState, E as EmptyState } from "./States-BZKT3Fib.js";
import { P as PrimaryButton, M as Modal, F as FormField, T as TextInput, a as TextArea } from "./FormControls-5gujQwST.js";
import { a as useCampaigns, d as usePlaylists, s as useCreateCampaign, t as useUpdateCampaign, v as useDeleteCampaign } from "./use-supabase-data-DWtjSxP7.js";
import { P as Plus } from "./plus-BVWsQpQr.js";
import { M as Megaphone } from "./megaphone-BBmJQQfG.js";
import { L as Layers } from "./layers-56A3WZ9s.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import { f as format } from "./format-CQRxTKmm.js";
import { p as ptBR } from "./pt-BR-CSc2i26k.js";
import { E as Eye } from "./eye-B03_hUEz.js";
import { P as Play } from "./play-Bb_PQeSD.js";
import { T as Trash2 } from "./trash-2-B6pEYlNh.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.js";
import "./utils-Bz4m9VPB.js";
import "./loader-circle-DWZmQ-AH.js";
import "./x-Vv-VrOr6.js";
import "./en-US-D5MXwIXi.js";
const __iconNode$1 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode$1);
const __iconNode = [
  ["rect", { x: "14", y: "3", width: "5", height: "18", rx: "1", key: "kaeet6" }],
  ["rect", { x: "5", y: "3", width: "5", height: "18", rx: "1", key: "1wsw3u" }]
];
const Pause = createLucideIcon("pause", __iconNode);
const statusTone = {
  active: "success",
  scheduled: "primary",
  paused: "warning",
  ended: "neutral",
  draft: "neutral"
};
const statusLabel = {
  active: "Ativa",
  scheduled: "Agendada",
  paused: "Pausada",
  ended: "Encerrada",
  draft: "Rascunho"
};
function CampaignsPage() {
  const {
    data: campaigns = [],
    isLoading,
    error
  } = useCampaigns();
  const {
    data: playlists = []
  } = usePlaylists();
  const create = useCreateCampaign();
  const update = useUpdateCampaign();
  const remove = useDeleteCampaign();
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    name: "",
    description: "",
    playlist_id: "",
    priority: 5,
    start_at: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
    end_at: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 16)
  });
  const submit = async (e) => {
    e.preventDefault();
    if (!form.playlist_id) return;
    await create.mutateAsync({
      name: form.name,
      description: form.description,
      playlist_id: form.playlist_id,
      priority: form.priority,
      start_at: new Date(form.start_at).toISOString(),
      end_at: new Date(form.end_at).toISOString(),
      status: "scheduled"
    });
    setOpen(false);
    setForm({
      ...form,
      name: "",
      description: ""
    });
  };
  const togglePause = (id, status) => {
    update.mutate({
      id,
      status: status === "paused" ? "active" : "paused"
    });
  };
  const playlistName = (id) => playlists.find((p) => p.id === id)?.name ?? "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Campanhas", subtitle: "Crie, programe e veicule playlists em grupos de telas e unidades.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(PrimaryButton, { onClick: () => setOpen(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
      " Nova campanha"
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingState, {}) : error ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error }) : campaigns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Megaphone, title: "Nenhuma campanha criada", description: "Crie sua primeira campanha vinculando uma playlist a telas e horários.", action: /* @__PURE__ */ jsxRuntimeExports.jsxs(PrimaryButton, { onClick: () => setOpen(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
      " Nova campanha"
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4", children: campaigns.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "group rounded-xl border border-border bg-card overflow-hidden shadow-card hover:border-primary/40 hover:shadow-glow transition-smooth", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-32 bg-gradient-primary overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 left-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { tone: statusTone[c.status], label: statusLabel[c.status].toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { tone: "primary", label: `PRIO ${c.priority}`, withDot: false })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-3 left-3 right-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold leading-tight", children: c.name }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: c.description ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-[11px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Layers, label: "Playlist", value: playlistName(c.playlist_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Megaphone, label: "Status", value: statusLabel[c.status] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Calendar, label: "Início", value: format(new Date(c.start_at), "dd/MM/yyyy", {
            locale: ptBR
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Calendar, label: "Fim", value: format(new Date(c.end_at), "dd/MM/yyyy", {
            locale: ptBR
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 pt-3 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app/preview", className: "flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs hover:bg-accent transition-smooth", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }),
            " Preview"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => togglePause(c.id, c.status), className: "flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-1.5 text-xs hover:bg-primary/20 transition-smooth", children: c.status === "paused" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3 w-3" }),
            " Retomar"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-3 w-3" }),
            " Pausar"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => confirm("Excluir esta campanha?") && remove.mutate(c.id), className: "h-7 w-7 grid place-items-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] })
      ] })
    ] }, c.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { open, onClose: () => setOpen(false), title: "Nova campanha", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Nome", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { required: true, value: form.name, onChange: (e) => setForm({
        ...form,
        name: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Descrição", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextArea, { value: form.description, onChange: (e) => setForm({
        ...form,
        description: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Playlist", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: form.playlist_id, onChange: (e) => setForm({
        ...form,
        playlist_id: e.target.value
      }), className: "w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Selecione…" }),
        playlists.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, children: p.name }, p.id))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Início", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "datetime-local", required: true, value: form.start_at, onChange: (e) => setForm({
          ...form,
          start_at: e.target.value
        }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Fim", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "datetime-local", required: true, value: form.end_at, onChange: (e) => setForm({
          ...form,
          end_at: e.target.value
        }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Prioridade (1-10)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "number", min: 1, max: 10, value: form.priority, onChange: (e) => setForm({
        ...form,
        priority: Number(e.target.value)
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PrimaryButton, { type: "submit", disabled: create.isPending, children: create.isPending ? "Salvando…" : "Criar campanha" })
    ] }) })
  ] });
}
function Stat({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-surface/50 px-2.5 py-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground font-medium truncate mt-0.5", children: value })
  ] });
}
export {
  CampaignsPage as component
};

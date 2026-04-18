import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { P as PageHeader } from "./PageHeader-Dkx9-OAF.js";
import { P as Panel } from "./Panel-iDal3y1F.js";
import { S as StatusBadge } from "./StatusBadge-CQeJIG5P.js";
import { L as LoadingState, a as ErrorState, E as EmptyState } from "./States-BZKT3Fib.js";
import { P as PrimaryButton, M as Modal, F as FormField, T as TextInput } from "./FormControls-5gujQwST.js";
import { u as useMedia, m as useCreateMedia, n as useDeleteMedia } from "./use-supabase-data-DWtjSxP7.js";
import { g as getMediaUrlCandidates, a as applyMediaFallback } from "./media-url-DiXiTFtW.js";
import { P as Plus } from "./plus-BVWsQpQr.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import { T as Trash2 } from "./trash-2-B6pEYlNh.js";
import { f as format } from "./format-CQRxTKmm.js";
import { p as ptBR } from "./pt-BR-CSc2i26k.js";
import { S as Search } from "./search-C6GadLXe.js";
import { F as Funnel } from "./funnel-CZoT3gdr.js";
import { I as Image } from "./image-BY4KT0BQ.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-Bz4m9VPB.js";
import "./loader-circle-DWZmQ-AH.js";
import "./x-Vv-VrOr6.js";
import "./router-BfC5KUx0.js";
import "./index-Cf78ubZ7.js";
import "./en-US-D5MXwIXi.js";
const __iconNode$3 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 12.5 8 15l2 2.5", key: "1tg20x" }],
  ["path", { d: "m14 12.5 2 2.5-2 2.5", key: "yinavb" }]
];
const FileCode = createLucideIcon("file-code", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16", key: "9kzy35" }],
  ["path", { d: "M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2", key: "1t0f0t" }],
  ["circle", { cx: "13", cy: "7", r: "1", fill: "currentColor", key: "1obus6" }],
  ["rect", { x: "8", y: "2", width: "14", height: "14", rx: "2", key: "1gvhby" }]
];
const Images = createLucideIcon("images", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",
      key: "ftymec"
    }
  ],
  ["rect", { x: "2", y: "6", width: "14", height: "12", rx: "2", key: "158x01" }]
];
const Video = createLucideIcon("video", __iconNode);
function MediaPage() {
  const {
    data: media = [],
    isLoading,
    error
  } = useMedia();
  const create = useCreateMedia();
  const remove = useDeleteMedia();
  const [open, setOpen] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const [form, setForm] = reactExports.useState({
    name: "",
    file_type: "image",
    public_url: "",
    duration_seconds: 10
  });
  const filtered = media.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  const submit = async (e) => {
    e.preventDefault();
    await create.mutateAsync({
      name: form.name,
      file_type: form.file_type,
      file_path: form.public_url,
      public_url: form.public_url,
      thumbnail_url: form.public_url,
      duration_seconds: form.duration_seconds,
      tags: [],
      status: "active"
    });
    setOpen(false);
    setForm({
      name: "",
      file_type: "image",
      public_url: "",
      duration_seconds: 10
    });
  };
  const iconFor = (t) => t.includes("video") ? Video : t.includes("html") ? FileCode : Image;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Biblioteca de mídias", subtitle: "Arquivos disponíveis para uso em playlists e campanhas.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(PrimaryButton, { onClick: () => setOpen(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
      " Adicionar mídia"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpen(true), className: "block w-full rounded-xl border-2 border-dashed border-border bg-surface/30 p-8 text-center hover:border-primary/40 hover:bg-surface/50 transition-smooth", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-12 w-12 rounded-xl bg-primary/10 grid place-items-center text-primary mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-base font-semibold", children: "Adicionar arquivo via URL" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Cole a URL pública da imagem, vídeo ou HTML. Upload completo via Storage chega em breve." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: `${media.length} arquivos`, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Buscar mídia…", className: "rounded-md border border-input bg-surface pl-7 pr-3 py-1.5 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-ring" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs hover:bg-accent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "h-3.5 w-3.5" }),
        " Filtrar"
      ] })
    ] }), children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingState, {}) : error ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Images, title: "Nenhuma mídia", description: "Adicione arquivos para usar em campanhas." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3", children: filtered.map((m) => {
      const Icon = iconFor(m.file_type);
      const sources = getMediaUrlCandidates(m.thumbnail_url, m.public_url);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "group rounded-lg border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-glow transition-smooth", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-video bg-surface overflow-hidden", children: [
          sources.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: sources[0], "data-sources": JSON.stringify(sources), "data-source-index": "0", alt: m.name, className: "w-full h-full object-cover", loading: "lazy", referrerPolicy: "no-referrer", onError: (e) => applyMediaFallback(e.currentTarget) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full grid place-items-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[10px] text-white uppercase tracking-wider font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-2.5 w-2.5" }),
            " ",
            m.file_type
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1.5 right-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { tone: m.status === "active" ? "success" : "neutral", label: m.status, withDot: false }) }),
          m.duration_seconds && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-1.5 left-1.5 text-[10px] text-white font-mono bg-black/60 backdrop-blur-md rounded px-1.5 py-0.5", children: [
            m.duration_seconds,
            "s"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium truncate flex-1", children: m.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => confirm("Remover mídia?") && remove.mutate(m.id), className: "h-5 w-5 grid place-items-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: format(new Date(m.created_at), "dd/MM", {
            locale: ptBR
          }) })
        ] })
      ] }, m.id);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { open, onClose: () => setOpen(false), title: "Adicionar mídia", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Nome", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { required: true, value: form.name, onChange: (e) => setForm({
        ...form,
        name: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Tipo", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: form.file_type, onChange: (e) => setForm({
        ...form,
        file_type: e.target.value
      }), className: "w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "image", children: "Imagem" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "video", children: "Vídeo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "html", children: "HTML" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "URL pública", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "url", required: true, placeholder: "https://…", value: form.public_url, onChange: (e) => setForm({
        ...form,
        public_url: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Duração (segundos)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "number", min: 1, value: form.duration_seconds, onChange: (e) => setForm({
        ...form,
        duration_seconds: Number(e.target.value)
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PrimaryButton, { type: "submit", disabled: create.isPending, children: create.isPending ? "Salvando…" : "Adicionar" })
    ] }) })
  ] });
}
export {
  MediaPage as component
};

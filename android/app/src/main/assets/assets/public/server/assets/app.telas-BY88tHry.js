import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { L as Link, t as toast, b as useQueryClient, a as useAuth, s as supabase } from "./router-BfC5KUx0.js";
import { P as PageHeader } from "./PageHeader-Dkx9-OAF.js";
import { P as Panel } from "./Panel-iDal3y1F.js";
import { S as StatusBadge } from "./StatusBadge-CQeJIG5P.js";
import { L as LoadingState, a as ErrorState, E as EmptyState } from "./States-BZKT3Fib.js";
import { b as useScreens, g as useUnits, j as useDeleteScreen } from "./use-supabase-data-DWtjSxP7.js";
import { u as useServerFn } from "./useServerFn-BRV6kz2q.js";
import { C as Cpu, b as claimPairingCode } from "./screens.functions-Cx9bWxwm.js";
import { P as Plus } from "./plus-BVWsQpQr.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import { T as Tv } from "./tv-BGJcO9c3.js";
import { M as MonitorSmartphone } from "./monitor-smartphone-rPMzOhZf.js";
import { M as MapPin } from "./map-pin-BaN5Ohl6.js";
import { f as formatDistanceToNow } from "./formatDistanceToNow-B2VnRvYV.js";
import { T as Trash2 } from "./trash-2-B6pEYlNh.js";
import { S as Search } from "./search-C6GadLXe.js";
import { X } from "./x-Vv-VrOr6.js";
import { L as LoaderCircle } from "./loader-circle-DWZmQ-AH.js";
import { p as ptBR } from "./pt-BR-CSc2i26k.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.js";
import "./utils-Bz4m9VPB.js";
import "./createSsrRpc-BdiZaWN2.js";
import "./en-US-D5MXwIXi.js";
const __iconNode = [
  ["path", { d: "M12 17v4", key: "1riwvh" }],
  ["path", { d: "M17 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 1.184-1.826", key: "cv7jms" }],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }],
  ["path", { d: "M8 21h8", key: "1ev6f3" }],
  ["path", { d: "M8.656 3H20a2 2 0 0 1 2 2v10a2 2 0 0 1-.293 1.042", key: "z8ni2w" }]
];
const MonitorOff = createLucideIcon("monitor-off", __iconNode);
function ScreensPage() {
  const screensQ = useScreens();
  const unitsQ = useUnits();
  const del = useDeleteScreen();
  const [q, setQ] = reactExports.useState("");
  const [pairOpen, setPairOpen] = reactExports.useState(false);
  const screens = screensQ.data ?? [];
  const units = unitsQ.data ?? [];
  const unitName = (id) => units.find((u) => u.id === id)?.name ?? "—";
  const filtered = reactExports.useMemo(() => screens.filter((s) => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.pairing_code?.toLowerCase().includes(q.toLowerCase())), [screens, q]);
  const handleDelete = async (id, name) => {
    if (!confirm(`Excluir tela "${name}"?`)) return;
    try {
      await del.mutateAsync(id);
      toast.success("Tela excluída.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Telas / Players", subtitle: "Gerencie todos os dispositivos físicos conectados ao Signix.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPairOpen(true), className: "inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
      " Adicionar tela"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [{
      l: "Total",
      v: screens.length
    }, {
      l: "Online",
      v: screens.filter((s) => s.is_online).length
    }, {
      l: "Offline",
      v: screens.filter((s) => s.device_status === "offline").length
    }, {
      l: "Atenção",
      v: screens.filter((s) => s.device_status === "warning").length
    }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: s.l }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-2xl font-bold mt-1", children: s.v })
    ] }, s.l)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: `${filtered.length} dispositivos`, description: "Lista completa com filtros e busca.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Buscar por nome, código…", className: "rounded-md border border-input bg-surface pl-7 pr-3 py-1.5 text-xs w-56 focus:outline-none focus:ring-2 focus:ring-ring" })
    ] }), bodyClassName: "p-0", children: screensQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingState, {}) : screensQ.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error: screensQ.error }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "Nenhuma tela cadastrada", description: "Abra a tela /pareamento na TV/player e use o código exibido para vincular o dispositivo.", icon: MonitorOff, action: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPairOpen(true), className: "inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
        " Parear novo player"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/pareamento", target: "_blank", className: "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs hover:bg-accent transition-smooth", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "h-3.5 w-3.5" }),
        " Abrir modo player"
      ] })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-surface/50 text-[11px] uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Tela" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Unidade" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Plataforma" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Resolução" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Último ping" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 w-10" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 hover:bg-surface/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-md bg-primary/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MonitorSmartphone, { className: "h-4 w-4 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: s.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground font-mono", children: s.pairing_code ?? "—" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 text-muted-foreground" }),
          unitName(s.unit_id)
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { tone: s.is_online ? "success" : s.device_status === "warning" ? "warning" : "destructive", label: s.device_status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Td, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { className: "h-3 w-3 text-muted-foreground" }),
            s.platform ?? "—"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-mono", children: s.player_version ?? "" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Td, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono", children: s.resolution ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: s.orientation })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: s.last_seen_at ? formatDistanceToNow(new Date(s.last_seen_at), {
          locale: ptBR,
          addSuffix: true
        }) : "nunca" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(s.id, s.name), className: "h-7 w-7 grid place-items-center rounded-md hover:bg-destructive/10 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }) })
      ] }, s.id)) })
    ] }) }) }),
    pairOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(PairScreenModal, { onClose: () => setPairOpen(false), units })
  ] });
}
function PairScreenModal({
  onClose,
  units
}) {
  const qc = useQueryClient();
  const claimPairingCodeFn = useServerFn(claimPairingCode);
  const {
    profile
  } = useAuth();
  const [code, setCode] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [unitId, setUnitId] = reactExports.useState("");
  const [orientation, setOrientation] = reactExports.useState("landscape");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const {
        data: sessionData
      } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Sessão expirada. Entre novamente.");
      const res = await claimPairingCodeFn({
        data: {
          code: code.trim(),
          name,
          unit_id: unitId || null,
          orientation
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res?.ok || !res.screen_id) throw new Error("Falha ao concluir o pareamento.");
      const screenName = res?.screen_name ?? name;
      toast.success(`Tela "${screenName}" pareada com sucesso!`);
      qc.invalidateQueries({
        queryKey: ["screens", profile?.organization_id]
      });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao parear.");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-5 py-3.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-primary/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "h-4 w-4 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-base font-bold", children: "Parear nova tela" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Informe o código exibido no player." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "h-7 w-7 grid place-items-center rounded-md hover:bg-accent", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-semibold", children: "Código de pareamento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: code, onChange: (e) => setCode(e.target.value.toUpperCase()), placeholder: "ABCD-1234", required: true, autoFocus: true, className: "mt-1 w-full rounded-md border border-input bg-surface px-3 py-2.5 font-mono text-lg tracking-widest text-center uppercase focus:outline-none focus:ring-2 focus:ring-ring" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-[11px] text-muted-foreground", children: [
          "Abra ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-foreground", children: "/pareamento" }),
          " na TV para ver o código."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-semibold", children: "Nome da tela" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Ex.: Recepção / Vitrine principal", required: true, minLength: 2, className: "mt-1 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-semibold", children: "Unidade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: unitId, onChange: (e) => setUnitId(e.target.value), className: "mt-1 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Sem unidade" }),
            units.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.name }, u.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-semibold", children: "Orientação" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: orientation, onChange: (e) => setOrientation(e.target.value), className: "mt-1 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "landscape", children: "Paisagem" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "portrait", children: "Retrato" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "rounded-md border border-border bg-surface px-3 py-1.5 text-xs hover:bg-accent transition-smooth", children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: submitting, className: "inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-60", children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
          " Pareando…"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          " Parear tela"
        ] }) })
      ] })
    ] })
  ] }) });
}
function Th({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-semibold", children });
}
function Td({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 align-middle", children });
}
export {
  ScreensPage as component
};

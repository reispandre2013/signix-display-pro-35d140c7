import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { b as useQueryClient, a as useAuth, t as toast } from "./router-BfC5KUx0.js";
import { P as PageHeader } from "./PageHeader-Dkx9-OAF.js";
import { P as Panel } from "./Panel-iDal3y1F.js";
import { S as StatusBadge } from "./StatusBadge-CQeJIG5P.js";
import { L as LoadingState, a as ErrorState, E as EmptyState } from "./States-BZKT3Fib.js";
import { b as useScreens, g as useUnits, a as useCampaigns } from "./use-supabase-data-DWtjSxP7.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import { L as LoaderCircle } from "./loader-circle-DWZmQ-AH.js";
import { R as RefreshCw } from "./refresh-cw-Dj7JKiR8.js";
import { T as Tv } from "./tv-BGJcO9c3.js";
import { W as WifiOff } from "./wifi-off-DwsFMQ0I.js";
import { f as formatDistanceToNow } from "./formatDistanceToNow-B2VnRvYV.js";
import { E as Eye } from "./eye-B03_hUEz.js";
import { M as MonitorSmartphone } from "./monitor-smartphone-rPMzOhZf.js";
import { p as ptBR } from "./pt-BR-CSc2i26k.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.js";
import "./utils-Bz4m9VPB.js";
import "./en-US-D5MXwIXi.js";
const __iconNode$1 = [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
];
const LayoutGrid = createLucideIcon("layout-grid", __iconNode$1);
const __iconNode = [
  ["path", { d: "M3 5h.01", key: "18ugdj" }],
  ["path", { d: "M3 12h.01", key: "nlz23k" }],
  ["path", { d: "M3 19h.01", key: "noohij" }],
  ["path", { d: "M8 5h13", key: "1pao27" }],
  ["path", { d: "M8 12h13", key: "1za7za" }],
  ["path", { d: "M8 19h13", key: "m83p4d" }]
];
const List = createLucideIcon("list", __iconNode);
function MonitorPage() {
  const {
    data: screens = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useScreens();
  const {
    data: units = []
  } = useUnits();
  const {
    data: campaigns = []
  } = useCampaigns();
  const [view, setView] = reactExports.useState("grid");
  const qc = useQueryClient();
  const {
    profile
  } = useAuth();
  const orgId = profile?.organization_id ?? null;
  const handleSync = async () => {
    try {
      await Promise.all([qc.invalidateQueries({
        queryKey: ["screens", orgId]
      }), qc.invalidateQueries({
        queryKey: ["units", orgId]
      }), qc.invalidateQueries({
        queryKey: ["campaigns", orgId]
      })]);
      await refetch();
      toast.success("Dados sincronizados.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao sincronizar.");
    }
  };
  const unitName = (id) => units.find((u) => u.id === id)?.name ?? "Sem unidade";
  const campaignName = (id) => campaigns.find((c) => c.id === id)?.name ?? null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Monitoramento em tempo real", subtitle: "Saúde, status e atividade de cada player.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[11px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-success pulse-dot" }),
        " Live"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex rounded-md border border-border bg-surface p-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("grid"), className: `p-1.5 rounded ${view === "grid" ? "bg-accent" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("table"), className: `p-1.5 rounded ${view === "table" ? "bg-accent" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-3.5 w-3.5" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSync, disabled: isFetching, className: "inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-60", children: [
        isFetching ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
        "Sincronizar"
      ] })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingState, {}) : error ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error }) : screens.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Tv, title: "Nenhuma tela cadastrada", description: "Adicione players na seção Telas para monitorá-los aqui." }) }) : view === "grid" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4", children: screens.map((s) => {
      const offline = s.device_status === "offline" || !s.is_online;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group rounded-xl border border-border bg-card overflow-hidden shadow-card hover:border-primary/40 hover:shadow-glow transition-smooth", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-video bg-gradient-surface overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full grid place-items-center", children: offline ? /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "h-10 w-10 text-muted-foreground/40" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "h-10 w-10 text-primary/40" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 left-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: s.device_status }) }),
          s.resolution && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/50 backdrop-blur-md px-2 py-0.5 text-[10px] text-white font-mono", children: s.resolution }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-black/50 backdrop-blur-md px-1.5 py-0.5", children: s.platform ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-black/50 backdrop-blur-md px-1.5 py-0.5 font-mono", children: s.player_version ?? "—" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: s.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground truncate", children: unitName(s.unit_id) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/80", children: "Em exibição:" }),
              " ",
              campaignName(s.current_campaign_id) ?? "—"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5", children: [
              "Último ping",
              " ",
              s.last_seen_at ? formatDistanceToNow(new Date(s.last_seen_at), {
                locale: ptBR,
                addSuffix: true
              }) : "—"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 pt-2 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-accent transition-smooth", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }),
            " Detalhes"
          ] }) })
        ] })
      ] }, s.id);
    }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { bodyClassName: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-surface/50 text-[11px] uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left", children: "Tela" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left", children: "Unidade" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left", children: "Último ping" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left", children: "Sync" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left", children: "Campanha" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: screens.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 hover:bg-surface/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MonitorSmartphone, { className: "h-4 w-4 text-muted-foreground" }),
          s.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: unitName(s.unit_id) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: s.device_status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: s.last_seen_at ? formatDistanceToNow(new Date(s.last_seen_at), {
          locale: ptBR,
          addSuffix: true
        }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: s.last_sync_at ? formatDistanceToNow(new Date(s.last_sync_at), {
          locale: ptBR,
          addSuffix: true
        }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 truncate max-w-xs", children: campaignName(s.current_campaign_id) ?? "—" })
      ] }, s.id)) })
    ] }) }) })
  ] });
}
export {
  MonitorPage as component
};

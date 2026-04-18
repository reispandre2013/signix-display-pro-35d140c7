import { U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { P as PageHeader } from "./PageHeader-Dkx9-OAF.js";
import { P as Panel } from "./Panel-iDal3y1F.js";
import { L as LoadingState, a as ErrorState, E as EmptyState } from "./States-BZKT3Fib.js";
import { w as useAuditLogs, e as useUsers } from "./use-supabase-data-DWtjSxP7.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import { S as ScrollText } from "./scroll-text-D2gvFEnH.js";
import { U as User } from "./user-BVQ1qz6K.js";
import { f as format } from "./format-CQRxTKmm.js";
import { p as ptBR } from "./pt-BR-CSc2i26k.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-Bz4m9VPB.js";
import "./loader-circle-DWZmQ-AH.js";
import "./router-BfC5KUx0.js";
import "./index-Cf78ubZ7.js";
import "./en-US-D5MXwIXi.js";
const __iconNode = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["circle", { cx: "11.5", cy: "14.5", r: "2.5", key: "1bq0ko" }],
  ["path", { d: "M13.3 16.3 15 18", key: "2quom7" }]
];
const FileSearch = createLucideIcon("file-search", __iconNode);
function AuditPage() {
  const {
    data: logs = [],
    isLoading,
    error
  } = useAuditLogs();
  const {
    data: users = []
  } = useUsers();
  const userName = (id) => users.find((u) => u.id === id)?.name ?? "Sistema";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Logs e auditoria", subtitle: "Registro completo de ações realizadas no sistema." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { bodyClassName: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingState, {}) : error ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error }) : logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: FileSearch, title: "Nenhum log registrado", description: "As ações realizadas no painel aparecerão aqui." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: logs.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-4 px-5 py-3.5 hover:bg-surface/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-primary/10 grid place-items-center text-primary shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollText, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3 text-muted-foreground" }),
          userName(l.actor_profile_id)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          " ",
          l.action,
          " "
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-medium", children: l.entity_type }),
        l.entity_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: " · " }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px]", children: l.entity_id.slice(0, 8) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground font-mono shrink-0", children: format(new Date(l.created_at), "dd/MM HH:mm", {
        locale: ptBR
      }) })
    ] }, l.id)) }) })
  ] });
}
export {
  AuditPage as component
};

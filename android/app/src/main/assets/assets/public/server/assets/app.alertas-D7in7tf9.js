import { U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { P as PageHeader } from "./PageHeader-Dkx9-OAF.js";
import { P as Panel } from "./Panel-iDal3y1F.js";
import { S as StatusBadge } from "./StatusBadge-CQeJIG5P.js";
import { L as LoadingState, a as ErrorState, E as EmptyState } from "./States-BZKT3Fib.js";
import {
  c as useAlerts,
  b as useScreens,
  x as useResolveAlert,
} from "./use-supabase-data-DWtjSxP7.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import { T as TriangleAlert } from "./triangle-alert-D0o9-cXK.js";
import { f as formatDistanceToNow } from "./formatDistanceToNow-B2VnRvYV.js";
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
const __iconNode$1 = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  [
    "path",
    {
      d: "M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742",
      key: "178tsu",
    },
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }],
  ["path", { d: "M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05", key: "1hqiys" }],
];
const BellOff = createLucideIcon("bell-off", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }],
];
const CircleCheck = createLucideIcon("circle-check", __iconNode);
const sevTone = {
  critical: "destructive",
  high: "destructive",
  medium: "warning",
  low: "info",
};
const sevLabel = {
  critical: "Crítica",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};
function AlertsPage() {
  const { data: alerts = [], isLoading, error } = useAlerts();
  const { data: screens = [] } = useScreens();
  const resolve = useResolveAlert();
  const screenName = (id) => screens.find((s) => s.id === id)?.name ?? "Tela desconhecida";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "space-y-6",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, {
        title: "Alertas e falhas",
        subtitle: "Eventos detectados nos players com nível de severidade.",
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "grid grid-cols-2 lg:grid-cols-4 gap-3",
        children: [
          {
            l: "Críticos",
            v: alerts.filter((a) => a.severity === "critical").length,
          },
          {
            l: "Alta",
            v: alerts.filter((a) => a.severity === "high").length,
          },
          {
            l: "Pendentes",
            v: alerts.filter((a) => !a.resolved_at).length,
          },
          {
            l: "Resolvidos",
            v: alerts.filter((a) => a.resolved_at).length,
          },
        ].map((s) =>
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-lg border border-border bg-card p-3",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-[10px] uppercase tracking-wider text-muted-foreground",
                  children: s.l,
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "font-display text-2xl font-bold mt-1",
                  children: s.v,
                }),
              ],
            },
            s.l,
          ),
        ),
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, {
        bodyClassName: "p-0",
        children: isLoading
          ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingState, {})
          : error
            ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error })
            : alerts.length === 0
              ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, {
                  icon: BellOff,
                  title: "Nenhum alerta registrado",
                  description: "Os alertas dos seus players aparecem aqui em tempo real.",
                })
              : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", {
                  className: "divide-y divide-border",
                  children: alerts.map((a) => {
                    const resolved = !!a.resolved_at;
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "li",
                      {
                        className:
                          "flex items-start gap-4 px-5 py-4 hover:bg-surface/40 transition-colors",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                            className: `h-9 w-9 rounded-lg grid place-items-center shrink-0 ${resolved ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`,
                            children: resolved
                              ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, {
                                  className: "h-4 w-4",
                                })
                              : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, {
                                  className: "h-4 w-4",
                                }),
                          }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                            className: "flex-1 min-w-0",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                                className: "flex items-center gap-2 flex-wrap",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                                    className: "text-sm font-medium",
                                    children: a.alert_type,
                                  }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, {
                                    tone: sevTone[a.severity],
                                    label: sevLabel[a.severity],
                                    withDot: false,
                                  }),
                                ],
                              }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                                className: "text-[11px] text-muted-foreground mt-0.5",
                                children: [
                                  screenName(a.screen_id),
                                  " ·",
                                  " ",
                                  formatDistanceToNow(new Date(a.created_at), {
                                    locale: ptBR,
                                    addSuffix: true,
                                  }),
                                ],
                              }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                                className: "text-xs text-muted-foreground mt-1.5",
                                children: a.message,
                              }),
                            ],
                          }),
                          !resolved
                            ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                                disabled: resolve.isPending,
                                onClick: () => resolve.mutate(a.id),
                                className:
                                  "text-xs rounded-md border border-border bg-surface px-2.5 py-1 hover:bg-accent disabled:opacity-50",
                                children: "Resolver",
                              })
                            : /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, {
                                tone: "success",
                                label: "Resolvido",
                                withDot: false,
                              }),
                        ],
                      },
                      a.id,
                    );
                  }),
                }),
      }),
    ],
  });
}
export { AlertsPage as component };

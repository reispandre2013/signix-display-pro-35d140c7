import { j as e } from "./index-DUcMANMA.js";
import { P as n } from "./PageHeader-C0iFmY02.js";
import { P as d } from "./Panel-0HKdxBPL.js";
import { L as c, a as l, E as p } from "./States-snX8_8k6.js";
import { w as x, e as f } from "./use-supabase-data-neXhdC03.js";
import { c as h } from "./createLucideIcon-BDYLgomD.js";
import { S as u } from "./scroll-text-S0arY9UM.js";
import { U as g } from "./user-DpkrebEC.js";
import { f as j } from "./format-Ca9zXj_K.js";
import { p as N } from "./pt-BR-B79SV-js.js";
import "./utils-BQHNewu7.js";
import "./loader-circle-BffduC8P.js";
import "./en-US-DfnapdEA.js";
const y = [
    [
      "path",
      {
        d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        key: "1oefj6",
      },
    ],
    ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
    ["circle", { cx: "11.5", cy: "14.5", r: "2.5", key: "1bq0ko" }],
    ["path", { d: "M13.3 16.3 15 18", key: "2quom7" }],
  ],
  v = h("file-search", y);
function R() {
  const { data: a = [], isLoading: r, error: t } = x(),
    { data: i = [] } = f(),
    o = (s) => i.find((m) => m.id === s)?.name ?? "Sistema";
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsx(n, {
        title: "Logs e auditoria",
        subtitle: "Registro completo de ações realizadas no sistema.",
      }),
      e.jsx(d, {
        bodyClassName: "p-0",
        children: r
          ? e.jsx(c, {})
          : t
            ? e.jsx(l, { error: t })
            : a.length === 0
              ? e.jsx(p, {
                  icon: v,
                  title: "Nenhum log registrado",
                  description: "As ações realizadas no painel aparecerão aqui.",
                })
              : e.jsx("ul", {
                  className: "divide-y divide-border",
                  children: a.map((s) =>
                    e.jsxs(
                      "li",
                      {
                        className: "flex items-center gap-4 px-5 py-3.5 hover:bg-surface/40",
                        children: [
                          e.jsx("div", {
                            className:
                              "h-8 w-8 rounded-lg bg-primary/10 grid place-items-center text-primary shrink-0",
                            children: e.jsx(u, { className: "h-4 w-4" }),
                          }),
                          e.jsx("div", {
                            className: "flex-1 min-w-0",
                            children: e.jsxs("p", {
                              className: "text-sm",
                              children: [
                                e.jsxs("span", {
                                  className: "font-medium inline-flex items-center gap-1",
                                  children: [
                                    e.jsx(g, { className: "h-3 w-3 text-muted-foreground" }),
                                    o(s.actor_profile_id),
                                  ],
                                }),
                                e.jsxs("span", {
                                  className: "text-muted-foreground",
                                  children: [" ", s.action, " "],
                                }),
                                e.jsx("span", {
                                  className: "text-primary font-medium",
                                  children: s.entity_type,
                                }),
                                s.entity_id &&
                                  e.jsxs(e.Fragment, {
                                    children: [
                                      e.jsx("span", {
                                        className: "text-muted-foreground",
                                        children: " · ",
                                      }),
                                      e.jsx("span", {
                                        className: "font-mono text-[11px]",
                                        children: s.entity_id.slice(0, 8),
                                      }),
                                    ],
                                  }),
                              ],
                            }),
                          }),
                          e.jsx("span", {
                            className: "text-[11px] text-muted-foreground font-mono shrink-0",
                            children: j(new Date(s.created_at), "dd/MM HH:mm", { locale: N }),
                          }),
                        ],
                      },
                      s.id,
                    ),
                  ),
                }),
      }),
    ],
  });
}
export { R as component };

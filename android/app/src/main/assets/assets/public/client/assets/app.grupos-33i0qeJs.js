import { r as l, j as e } from "./index-DUcMANMA.js";
import { P as f } from "./PageHeader-C0iFmY02.js";
import { P as N } from "./Panel-0HKdxBPL.js";
import { S as g } from "./StatusBadge-Deydaofp.js";
import { L as b, a as v, E as y } from "./States-snX8_8k6.js";
import { P as i, M as S, F as m, T as P, a as C } from "./FormControls-CVqdqSiZ.js";
import { o as w, p as E, q as G } from "./use-supabase-data-neXhdC03.js";
import { P as d } from "./plus-Cunu08C7.js";
import { L as p } from "./layers-9cNZ3afn.js";
import { T as L } from "./trash-2-DoR7LW8e.js";
import "./utils-BQHNewu7.js";
import "./loader-circle-BffduC8P.js";
import "./createLucideIcon-BDYLgomD.js";
import "./x-Dpfm6mfs.js";
function K() {
  const { data: n = [], isLoading: u, error: c } = w(),
    t = E(),
    x = G(),
    [h, r] = l.useState(!1),
    [a, o] = l.useState({ name: "", description: "" }),
    j = async (s) => {
      (s.preventDefault(),
        await t.mutateAsync({ name: a.name, description: a.description, status: "active" }),
        r(!1),
        o({ name: "", description: "" }));
    };
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsx(f, {
        title: "Grupos de telas",
        subtitle: "Agrupe telas por finalidade para distribuir campanhas em massa.",
        actions: e.jsxs(i, {
          onClick: () => r(!0),
          children: [e.jsx(d, { className: "h-3.5 w-3.5" }), " Novo grupo"],
        }),
      }),
      e.jsx(N, {
        bodyClassName: "p-0",
        children: u
          ? e.jsx(b, {})
          : c
            ? e.jsx(v, { error: c })
            : n.length === 0
              ? e.jsx(y, {
                  icon: p,
                  title: "Nenhum grupo criado",
                  description: "Crie grupos para enviar campanhas para múltiplas telas de uma vez.",
                  action: e.jsxs(i, {
                    onClick: () => r(!0),
                    children: [e.jsx(d, { className: "h-3.5 w-3.5" }), " Novo grupo"],
                  }),
                })
              : e.jsxs("table", {
                  className: "w-full text-sm",
                  children: [
                    e.jsx("thead", {
                      children: e.jsxs("tr", {
                        className:
                          "border-b border-border bg-surface/50 text-[11px] uppercase tracking-wider text-muted-foreground",
                        children: [
                          e.jsx("th", { className: "px-5 py-3 text-left", children: "Grupo" }),
                          e.jsx("th", { className: "px-5 py-3 text-left", children: "Descrição" }),
                          e.jsx("th", { className: "px-5 py-3 text-left", children: "Status" }),
                          e.jsx("th", { className: "px-5 py-3 w-10" }),
                        ],
                      }),
                    }),
                    e.jsx("tbody", {
                      children: n.map((s) =>
                        e.jsxs(
                          "tr",
                          {
                            className: "border-b border-border/50 hover:bg-surface/40",
                            children: [
                              e.jsx("td", {
                                className: "px-5 py-3.5",
                                children: e.jsxs("div", {
                                  className: "flex items-center gap-2.5",
                                  children: [
                                    e.jsx("div", {
                                      className:
                                        "h-8 w-8 rounded-md bg-primary/10 grid place-items-center text-primary",
                                      children: e.jsx(p, { className: "h-4 w-4" }),
                                    }),
                                    e.jsx("span", { className: "font-medium", children: s.name }),
                                  ],
                                }),
                              }),
                              e.jsx("td", {
                                className: "px-5 py-3.5 text-muted-foreground",
                                children: s.description ?? "—",
                              }),
                              e.jsx("td", {
                                className: "px-5 py-3.5",
                                children: e.jsx(g, {
                                  tone: s.status === "active" ? "success" : "neutral",
                                  label: s.status,
                                }),
                              }),
                              e.jsx("td", {
                                className: "px-5 py-3.5",
                                children: e.jsx("button", {
                                  onClick: () => confirm("Excluir grupo?") && x.mutate(s.id),
                                  className: "text-muted-foreground hover:text-destructive",
                                  children: e.jsx(L, { className: "h-4 w-4" }),
                                }),
                              }),
                            ],
                          },
                          s.id,
                        ),
                      ),
                    }),
                  ],
                }),
      }),
      e.jsx(S, {
        open: h,
        onClose: () => r(!1),
        title: "Novo grupo de telas",
        children: e.jsxs("form", {
          onSubmit: j,
          className: "space-y-3",
          children: [
            e.jsx(m, {
              label: "Nome",
              children: e.jsx(P, {
                required: !0,
                value: a.name,
                onChange: (s) => o({ ...a, name: s.target.value }),
              }),
            }),
            e.jsx(m, {
              label: "Descrição",
              children: e.jsx(C, {
                value: a.description,
                onChange: (s) => o({ ...a, description: s.target.value }),
              }),
            }),
            e.jsx(i, {
              type: "submit",
              disabled: t.isPending,
              children: t.isPending ? "Salvando…" : "Criar grupo",
            }),
          ],
        }),
      }),
    ],
  });
}
export { K as component };

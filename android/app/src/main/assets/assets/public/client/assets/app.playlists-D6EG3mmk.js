import { r as o, j as e, L as P } from "./index-DUcMANMA.js";
import { P as w } from "./PageHeader-C0iFmY02.js";
import { P as p } from "./Panel-0HKdxBPL.js";
import { S } from "./StatusBadge-Deydaofp.js";
import { L as C, a as E, E as x } from "./States-snX8_8k6.js";
import { P as c, M as L, F as u, T as k, a as F } from "./FormControls-CVqdqSiZ.js";
import { d as T, k as D, l as q } from "./use-supabase-data-neXhdC03.js";
import { P as h } from "./plus-Cunu08C7.js";
import { L as d } from "./list-video-BioUtere.js";
import { E as A } from "./eye-Cgf46zt5.js";
import { T as B } from "./trash-2-DoR7LW8e.js";
import "./utils-BQHNewu7.js";
import "./loader-circle-BffduC8P.js";
import "./createLucideIcon-BDYLgomD.js";
import "./x-Dpfm6mfs.js";
function Y() {
  const { data: r = [], isLoading: j, error: m } = T(),
    l = D(),
    g = q(),
    [f, i] = o.useState(!1),
    [y, v] = o.useState(null),
    [a, n] = o.useState({ name: "", description: "" }),
    t = r.find((s) => s.id === (y ?? r[0]?.id)),
    b = async (s) => {
      (s.preventDefault(),
        await l.mutateAsync({ name: a.name, description: a.description, status: "draft" }),
        i(!1),
        n({ name: "", description: "" }));
    };
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsx(w, {
        title: "Playlists",
        subtitle: "Sequências de mídias prontas para serem usadas em campanhas.",
        actions: e.jsxs(c, {
          onClick: () => i(!0),
          children: [e.jsx(h, { className: "h-3.5 w-3.5" }), " Nova playlist"],
        }),
      }),
      j
        ? e.jsx(C, {})
        : m
          ? e.jsx(E, { error: m })
          : r.length === 0
            ? e.jsx(p, {
                children: e.jsx(x, {
                  icon: d,
                  title: "Nenhuma playlist criada",
                  description: "Crie playlists para reutilizar em várias campanhas.",
                  action: e.jsxs(c, {
                    onClick: () => i(!0),
                    children: [e.jsx(h, { className: "h-3.5 w-3.5" }), " Nova playlist"],
                  }),
                }),
              })
            : e.jsxs("div", {
                className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
                children: [
                  e.jsx("div", {
                    className: "lg:col-span-1 space-y-3",
                    children: r.map((s) => {
                      const N = t?.id === s.id;
                      return e.jsxs(
                        "button",
                        {
                          onClick: () => v(s.id),
                          className: `w-full text-left rounded-lg border ${N ? "border-primary/50 bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/30"} p-4 transition-smooth`,
                          children: [
                            e.jsxs("div", {
                              className: "flex items-start justify-between gap-2",
                              children: [
                                e.jsxs("div", {
                                  className: "flex items-center gap-2",
                                  children: [
                                    e.jsx("div", {
                                      className:
                                        "h-9 w-9 rounded-lg bg-gradient-primary grid place-items-center",
                                      children: e.jsx(d, {
                                        className: "h-4 w-4 text-primary-foreground",
                                      }),
                                    }),
                                    e.jsxs("div", {
                                      children: [
                                        e.jsx("p", {
                                          className: "font-medium text-sm",
                                          children: s.name,
                                        }),
                                        e.jsx("p", {
                                          className: "text-[11px] text-muted-foreground",
                                          children: s.status,
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsx(S, {
                                  tone: s.status === "active" ? "success" : "neutral",
                                  label: s.status,
                                  withDot: !1,
                                }),
                              ],
                            }),
                            s.description &&
                              e.jsx("p", {
                                className: "text-[11px] text-muted-foreground mt-2 line-clamp-2",
                                children: s.description,
                              }),
                          ],
                        },
                        s.id,
                      );
                    }),
                  }),
                  e.jsx("div", {
                    className: "lg:col-span-2",
                    children:
                      t &&
                      e.jsx(p, {
                        title: t.name,
                        description: t.description ?? "Sem descrição",
                        actions: e.jsxs(e.Fragment, {
                          children: [
                            e.jsxs(P, {
                              to: "/app/preview",
                              className:
                                "inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs hover:bg-accent",
                              children: [e.jsx(A, { className: "h-3.5 w-3.5" }), " Preview"],
                            }),
                            e.jsxs("button", {
                              onClick: () => confirm("Excluir playlist?") && g.mutate(t.id),
                              className:
                                "inline-flex items-center gap-1 rounded-md text-destructive hover:bg-destructive/10 px-2.5 py-1.5 text-xs",
                              children: [e.jsx(B, { className: "h-3.5 w-3.5" }), " Excluir"],
                            }),
                          ],
                        }),
                        children: e.jsx(x, {
                          icon: d,
                          title: "Itens da playlist",
                          description:
                            "Em breve: arraste mídias da biblioteca para montar a sequência desta playlist.",
                        }),
                      }),
                  }),
                ],
              }),
      e.jsx(L, {
        open: f,
        onClose: () => i(!1),
        title: "Nova playlist",
        children: e.jsxs("form", {
          onSubmit: b,
          className: "space-y-3",
          children: [
            e.jsx(u, {
              label: "Nome",
              children: e.jsx(k, {
                required: !0,
                value: a.name,
                onChange: (s) => n({ ...a, name: s.target.value }),
              }),
            }),
            e.jsx(u, {
              label: "Descrição",
              children: e.jsx(F, {
                value: a.description,
                onChange: (s) => n({ ...a, description: s.target.value }),
              }),
            }),
            e.jsx(c, {
              type: "submit",
              disabled: l.isPending,
              children: l.isPending ? "Salvando…" : "Criar",
            }),
          ],
        }),
      }),
    ],
  });
}
export { Y as component };

import { r as j, j as e, t as i } from "./index-DUcMANMA.js";
import { P as f } from "./PageHeader-C0iFmY02.js";
import { S as v } from "./StatusBadge-Deydaofp.js";
import { L as b, a as N, E as y } from "./States-snX8_8k6.js";
import { u as C, P as m, M as w, F as r, T as t } from "./FormControls-CVqdqSiZ.js";
import { g as E, h as U, i as _ } from "./use-supabase-data-neXhdC03.js";
import { P as u } from "./plus-Cunu08C7.js";
import { B as P } from "./building-2-L8uGa92d.js";
import { M as S } from "./map-pin-D6S49P4C.js";
import { T as L } from "./trash-2-DoR7LW8e.js";
import { U as M } from "./user-DpkrebEC.js";
import { c as T } from "./createLucideIcon-BDYLgomD.js";
import "./utils-BQHNewu7.js";
import "./loader-circle-BffduC8P.js";
import "./x-Dpfm6mfs.js";
const k = [
    [
      "path",
      {
        d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
        key: "9njp5v",
      },
    ],
  ],
  F = T("phone", k);
function W() {
  const n = E(),
    x = U(),
    p = _(),
    s = C({ name: "", address: "", city: "", state: "", manager_name: "", manager_phone: "" }),
    [d, l] = j.useState(!1),
    h = async (a) => {
      if ((a.preventDefault(), !s.values.name)) return i.error("Informe o nome.");
      l(!0);
      try {
        (await x.mutateAsync(s.values), i.success("Unidade criada."), s.reset(), s.setOpen(!1));
      } catch (o) {
        i.error(o instanceof Error ? o.message : "Erro ao criar.");
      } finally {
        l(!1);
      }
    },
    g = async (a, o) => {
      if (confirm(`Excluir unidade "${o}"?`))
        try {
          (await p.mutateAsync(a), i.success("Excluída."));
        } catch (c) {
          i.error(c instanceof Error ? c.message : "Erro.");
        }
    };
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsx(f, {
        title: "Unidades / Locais",
        subtitle: "Locais físicos onde as telas estão instaladas.",
        actions: e.jsxs("button", {
          onClick: () => s.setOpen(!0),
          className:
            "inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow",
          children: [e.jsx(u, { className: "h-3.5 w-3.5" }), " Nova unidade"],
        }),
      }),
      n.isLoading
        ? e.jsx(b, {})
        : n.error
          ? e.jsx(N, { error: n.error })
          : (n.data?.length ?? 0) === 0
            ? e.jsx(y, {
                title: "Nenhuma unidade cadastrada",
                description:
                  "Cadastre filiais, lojas ou pontos de exibição para organizar suas telas.",
                icon: P,
                action: e.jsxs(m, {
                  onClick: () => s.setOpen(!0),
                  children: [e.jsx(u, { className: "h-3.5 w-3.5" }), " Criar primeira unidade"],
                }),
              })
            : e.jsx("div", {
                className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
                children: n.data.map((a) =>
                  e.jsxs(
                    "article",
                    {
                      className:
                        "rounded-xl border border-border bg-card p-5 shadow-card hover:border-primary/40 transition-smooth",
                      children: [
                        e.jsxs("div", {
                          className: "flex items-start justify-between",
                          children: [
                            e.jsx("div", {
                              className:
                                "h-10 w-10 rounded-lg bg-primary/10 grid place-items-center text-primary",
                              children: e.jsx(S, { className: "h-5 w-5" }),
                            }),
                            e.jsx("button", {
                              onClick: () => g(a.id, a.name),
                              className:
                                "h-7 w-7 grid place-items-center rounded-md hover:bg-destructive/10 text-destructive",
                              children: e.jsx(L, { className: "h-3.5 w-3.5" }),
                            }),
                          ],
                        }),
                        e.jsx("h3", {
                          className: "font-display text-base font-semibold mt-3",
                          children: a.name,
                        }),
                        e.jsxs("p", {
                          className: "text-xs text-muted-foreground mt-0.5",
                          children: [
                            a.address ?? "—",
                            " ",
                            a.city && `· ${a.city}`,
                            a.state && `/${a.state}`,
                          ],
                        }),
                        e.jsxs("div", {
                          className: "mt-4 grid grid-cols-2 gap-2 text-[11px]",
                          children: [
                            e.jsxs("div", {
                              className: "rounded-md bg-surface/50 px-2.5 py-1.5",
                              children: [
                                e.jsxs("div", {
                                  className: "flex items-center gap-1 text-muted-foreground",
                                  children: [e.jsx(M, { className: "h-3 w-3" }), " Responsável"],
                                }),
                                e.jsx("div", {
                                  className: "font-medium mt-0.5 truncate",
                                  children: a.manager_name ?? "—",
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className: "rounded-md bg-surface/50 px-2.5 py-1.5",
                              children: [
                                e.jsxs("div", {
                                  className: "flex items-center gap-1 text-muted-foreground",
                                  children: [e.jsx(F, { className: "h-3 w-3" }), " Telefone"],
                                }),
                                e.jsx("div", {
                                  className: "font-medium mt-0.5 truncate",
                                  children: a.manager_phone ?? "—",
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsx("div", {
                          className: "mt-4 pt-4 border-t border-border",
                          children: e.jsx(v, {
                            tone: a.status === "active" ? "success" : "neutral",
                            label: a.status,
                          }),
                        }),
                      ],
                    },
                    a.id,
                  ),
                ),
              }),
      e.jsx(w, {
        open: s.open,
        onClose: () => s.setOpen(!1),
        title: "Nova unidade",
        children: e.jsxs("form", {
          onSubmit: h,
          className: "space-y-3",
          children: [
            e.jsx(r, {
              label: "Nome *",
              children: e.jsx(t, {
                value: s.values.name,
                onChange: (a) => s.set("name", a.target.value),
                required: !0,
              }),
            }),
            e.jsx(r, {
              label: "Endereço",
              children: e.jsx(t, {
                value: s.values.address,
                onChange: (a) => s.set("address", a.target.value),
              }),
            }),
            e.jsxs("div", {
              className: "grid grid-cols-2 gap-3",
              children: [
                e.jsx(r, {
                  label: "Cidade",
                  children: e.jsx(t, {
                    value: s.values.city,
                    onChange: (a) => s.set("city", a.target.value),
                  }),
                }),
                e.jsx(r, {
                  label: "Estado (UF)",
                  children: e.jsx(t, {
                    maxLength: 2,
                    value: s.values.state,
                    onChange: (a) => s.set("state", a.target.value.toUpperCase()),
                  }),
                }),
              ],
            }),
            e.jsx(r, {
              label: "Responsável",
              children: e.jsx(t, {
                value: s.values.manager_name,
                onChange: (a) => s.set("manager_name", a.target.value),
              }),
            }),
            e.jsx(r, {
              label: "Telefone",
              children: e.jsx(t, {
                value: s.values.manager_phone,
                onChange: (a) => s.set("manager_phone", a.target.value),
              }),
            }),
            e.jsxs("div", {
              className: "flex justify-end gap-2 pt-2",
              children: [
                e.jsx("button", {
                  type: "button",
                  onClick: () => s.setOpen(!1),
                  className: "rounded-md border border-border px-3 py-2 text-xs",
                  children: "Cancelar",
                }),
                e.jsx(m, {
                  type: "submit",
                  disabled: d,
                  children: d ? "Salvando…" : "Criar unidade",
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
export { W as component };

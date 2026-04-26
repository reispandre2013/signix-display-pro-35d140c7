import { r as t, u as v, a as N, j as e, L as n, t as l } from "./index-DUcMANMA.js";
import { T as p } from "./tv-qkDTjJdC.js";
import { M as y } from "./mail-Dxt7XpX_.js";
import { L as w } from "./lock-ZHRdkGWQ.js";
import { c as k } from "./createLucideIcon-BDYLgomD.js";
import { E as S } from "./eye-Cgf46zt5.js";
import { L as E } from "./loader-circle-BffduC8P.js";
import { A as C } from "./arrow-right-DA0qr8cc.js";
const L = [
    [
      "path",
      {
        d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
        key: "ct8e1f",
      },
    ],
    ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
    [
      "path",
      {
        d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
        key: "13bj9a",
      },
    ],
    ["path", { d: "m2 2 20 20", key: "1ooewy" }],
  ],
  A = k("eye-off", L);
function _() {
  const [r, g] = t.useState(!1),
    [a, f] = t.useState(""),
    [o, h] = t.useState(""),
    [d, c] = t.useState(!1),
    i = v(),
    { signIn: b, session: m, loading: x } = N();
  t.useEffect(() => {
    !x && m && i({ to: "/app", replace: !0 });
  }, [x, m, i]);
  const j = async (s) => {
    if ((s.preventDefault(), !a || !o)) {
      l.error("Preencha e-mail e senha.");
      return;
    }
    c(!0);
    const { error: u } = await b(a.trim(), o);
    if ((c(!1), u)) {
      l.error(u.message ?? "Não foi possível entrar.");
      return;
    }
    (l.success("Bem-vindo!"), i({ to: "/app", replace: !0 }));
  };
  return e.jsxs("div", {
    className: "min-h-screen grid lg:grid-cols-2 bg-background bg-mesh",
    children: [
      e.jsxs("div", {
        className:
          "hidden lg:flex relative flex-col justify-between p-12 border-r border-border overflow-hidden",
        children: [
          e.jsx("div", {
            className:
              "absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent",
          }),
          e.jsxs("div", {
            className: "relative flex items-center gap-2.5",
            children: [
              e.jsx("div", {
                className:
                  "h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow",
                children: e.jsx(p, { className: "h-5 w-5 text-primary-foreground" }),
              }),
              e.jsxs("div", {
                children: [
                  e.jsx("p", { className: "font-display text-xl font-bold", children: "Signix" }),
                  e.jsx("p", {
                    className: "text-[11px] uppercase tracking-widest text-muted-foreground",
                    children: "Digital Signage Cloud",
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("div", {
            className: "relative space-y-6",
            children: [
              e.jsxs("h1", {
                className:
                  "font-display text-4xl xl:text-5xl font-bold leading-[1.05] tracking-tight",
                children: [
                  "Controle ",
                  e.jsx("span", { className: "text-gradient", children: "cada tela" }),
                  e.jsx("br", {}),
                  "do seu negócio em",
                  e.jsx("br", {}),
                  "tempo real.",
                ],
              }),
              e.jsx("p", {
                className: "text-muted-foreground max-w-md",
                children:
                  "Gerencie playlists, campanhas e dispositivos em todas as unidades a partir de um único painel premium.",
              }),
              e.jsx("div", {
                className: "grid grid-cols-3 gap-4 max-w-md pt-6",
                children: [
                  { v: "12k+", l: "Telas ativas" },
                  { v: "99.9%", l: "Uptime SLA" },
                  { v: "<2s", l: "Sincronização" },
                ].map((s) =>
                  e.jsxs(
                    "div",
                    {
                      className: "rounded-lg border border-border bg-card/60 px-3 py-3",
                      children: [
                        e.jsx("div", {
                          className: "font-display text-2xl font-bold text-gradient",
                          children: s.v,
                        }),
                        e.jsx("div", {
                          className: "text-[11px] text-muted-foreground mt-0.5",
                          children: s.l,
                        }),
                      ],
                    },
                    s.l,
                  ),
                ),
              }),
            ],
          }),
          e.jsx("div", {
            className: "relative text-xs text-muted-foreground",
            children: "© 2025 Signix · SaaS Enterprise",
          }),
        ],
      }),
      e.jsx("div", {
        className: "flex items-center justify-center p-6 lg:p-12",
        children: e.jsxs("div", {
          className: "w-full max-w-sm",
          children: [
            e.jsxs("div", {
              className: "lg:hidden mb-8 flex items-center gap-2.5",
              children: [
                e.jsx("div", {
                  className:
                    "h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow",
                  children: e.jsx(p, { className: "h-5 w-5 text-primary-foreground" }),
                }),
                e.jsx("p", { className: "font-display text-xl font-bold", children: "Signix" }),
              ],
            }),
            e.jsx("h2", {
              className: "font-display text-2xl font-bold",
              children: "Bem-vindo de volta",
            }),
            e.jsx("p", {
              className: "text-sm text-muted-foreground mt-1",
              children: "Acesse seu painel administrativo.",
            }),
            e.jsxs("form", {
              onSubmit: j,
              className: "mt-8 space-y-4",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("label", {
                      className: "text-xs font-medium text-muted-foreground mb-1.5 block",
                      children: "E-mail",
                    }),
                    e.jsxs("div", {
                      className: "relative",
                      children: [
                        e.jsx(y, {
                          className:
                            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                        }),
                        e.jsx("input", {
                          type: "email",
                          required: !0,
                          autoComplete: "email",
                          value: a,
                          onChange: (s) => f(s.target.value),
                          placeholder: "voce@empresa.com",
                          className:
                            "w-full rounded-lg border border-input bg-surface pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth",
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("div", {
                  children: [
                    e.jsxs("div", {
                      className: "flex items-center justify-between mb-1.5",
                      children: [
                        e.jsx("label", {
                          className: "text-xs font-medium text-muted-foreground",
                          children: "Senha",
                        }),
                        e.jsx(n, {
                          to: "/recuperar-senha",
                          className: "text-xs text-primary hover:underline",
                          children: "Esqueci a senha",
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "relative",
                      children: [
                        e.jsx(w, {
                          className:
                            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                        }),
                        e.jsx("input", {
                          type: r ? "text" : "password",
                          required: !0,
                          autoComplete: "current-password",
                          value: o,
                          onChange: (s) => h(s.target.value),
                          placeholder: "••••••••",
                          className:
                            "w-full rounded-lg border border-input bg-surface pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth",
                        }),
                        e.jsx("button", {
                          type: "button",
                          onClick: () => g(!r),
                          className:
                            "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                          children: r
                            ? e.jsx(A, { className: "h-4 w-4" })
                            : e.jsx(S, { className: "h-4 w-4" }),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx("button", {
                  type: "submit",
                  disabled: d,
                  className:
                    "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition-smooth disabled:opacity-60",
                  children: d
                    ? e.jsx(E, { className: "h-4 w-4 animate-spin" })
                    : e.jsxs(e.Fragment, {
                        children: ["Entrar no painel ", e.jsx(C, { className: "h-4 w-4" })],
                      }),
                }),
                e.jsxs("div", {
                  className: "relative my-6",
                  children: [
                    e.jsx("div", {
                      className: "absolute inset-0 flex items-center",
                      children: e.jsx("div", { className: "w-full border-t border-border" }),
                    }),
                    e.jsx("div", {
                      className: "relative flex justify-center",
                      children: e.jsx("span", {
                        className:
                          "bg-background px-3 text-[11px] uppercase tracking-widest text-muted-foreground",
                        children: "ou",
                      }),
                    }),
                  ],
                }),
                e.jsx(n, {
                  to: "/signup",
                  className:
                    "block w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-center text-sm font-medium hover:bg-accent transition-smooth",
                  children: "Criar nova conta",
                }),
                e.jsx(n, {
                  to: "/pareamento",
                  className:
                    "block w-full text-center text-xs text-muted-foreground hover:text-foreground transition-smooth",
                  children: "Parear um novo player →",
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
export { _ as component };

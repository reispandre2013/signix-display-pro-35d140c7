import {
  b as S,
  r as i,
  c as L,
  d as C,
  j as e,
  L as c,
  a as g,
  u as f,
  t as M,
  O as A,
} from "./index-DUcMANMA.js";
import { c as x } from "./utils-BQHNewu7.js";
import { T as E } from "./tv-qkDTjJdC.js";
import { c as l } from "./createLucideIcon-BDYLgomD.js";
import { A as P } from "./activity-CDzXOf4C.js";
import { M as _ } from "./monitor-Ck3Yxne9.js";
import { L as U } from "./layers-9cNZ3afn.js";
import { I as O } from "./image-BlTjWPMR.js";
import { L as z } from "./list-video-BioUtere.js";
import { M as B } from "./megaphone-CoxL7Qo6.js";
import { C as R } from "./calendar-clock-Dfjp_lJK.js";
import { E as D } from "./eye-Cgf46zt5.js";
import { B as T } from "./building-2-L8uGa92d.js";
import { M as I } from "./map-pin-D6S49P4C.js";
import { U as q } from "./users-CTV-MLrk.js";
import { C as $ } from "./chart-column-B9NtYDAS.js";
import { B as b, L as j } from "./log-out-56nkTb6W.js";
import { S as G } from "./scroll-text-S0arY9UM.js";
import { S as V } from "./search-DaE6IhiL.js";
import { P as H } from "./plus-Cunu08C7.js";
function y(r) {
  const s = S(),
    a = i.useRef(void 0);
  return L(s.stores.location, (t) => {
    const o = t;
    if (s.options.defaultStructuralSharing) {
      const d = C(a.current, o);
      return ((a.current = d), d);
    }
    return o;
  });
}
const K = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]],
  Q = l("chevron-down", K);
const W = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
    ["path", { d: "M12 17h.01", key: "p32p05" }],
  ],
  F = l("circle-question-mark", W);
const J = [
    ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
    ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
    ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
    ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }],
  ],
  X = l("layout-dashboard", J);
const Y = [
    [
      "path",
      {
        d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
        key: "1i5ecw",
      },
    ],
    ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
  ],
  Z = l("settings", Y);
const ee = [
    [
      "path",
      {
        d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
        key: "1s2grr",
      },
    ],
    ["path", { d: "M20 2v4", key: "1rf3ol" }],
    ["path", { d: "M22 4h-4", key: "gwowj6" }],
    ["circle", { cx: "4", cy: "20", r: "2", key: "6kqj1y" }],
  ],
  ae = l("sparkles", ee),
  se = [
    {
      title: "Operação",
      items: [
        { to: "/app", label: "Dashboard", icon: X },
        { to: "/app/monitoramento", label: "Monitoramento", icon: P },
        { to: "/app/telas", label: "Telas / Players", icon: _ },
        { to: "/app/grupos", label: "Grupos de telas", icon: U },
      ],
    },
    {
      title: "Conteúdo",
      items: [
        { to: "/app/midias", label: "Biblioteca de mídias", icon: O },
        { to: "/app/playlists", label: "Playlists", icon: z },
        { to: "/app/campanhas", label: "Campanhas", icon: B },
        { to: "/app/agendamentos", label: "Agendamentos", icon: R },
        { to: "/app/preview", label: "Preview de campanhas", icon: D },
      ],
    },
    {
      title: "Organização",
      items: [
        { to: "/app/empresas", label: "Empresas", icon: T },
        { to: "/app/unidades", label: "Unidades", icon: I },
        { to: "/app/usuarios", label: "Usuários", icon: q },
      ],
    },
    {
      title: "Inteligência",
      items: [
        { to: "/app/relatorios", label: "Relatórios", icon: $ },
        { to: "/app/alertas", label: "Alertas e falhas", icon: b },
        { to: "/app/auditoria", label: "Logs / auditoria", icon: G },
        { to: "/app/configuracoes", label: "Configurações", icon: Z },
      ],
    },
  ];
function re() {
  const { pathname: r } = y();
  return e.jsxs("aside", {
    className:
      "hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
    children: [
      e.jsxs("div", {
        className: "px-5 py-5 flex items-center gap-2.5 border-b border-sidebar-border",
        children: [
          e.jsxs("div", {
            className:
              "relative h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow",
            children: [
              e.jsx(E, { className: "h-5 w-5 text-primary-foreground" }),
              e.jsx("span", {
                className:
                  "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-sidebar pulse-dot",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "flex flex-col leading-tight",
            children: [
              e.jsx("span", {
                className: "font-display text-lg font-bold tracking-tight",
                children: "Signix",
              }),
              e.jsx("span", {
                className: "text-[10px] uppercase tracking-[0.2em] text-muted-foreground",
                children: "Digital Signage",
              }),
            ],
          }),
        ],
      }),
      e.jsx("nav", {
        className: "flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-6",
        children: se.map((s) =>
          e.jsxs(
            "div",
            {
              children: [
                e.jsx("div", {
                  className:
                    "px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
                  children: s.title,
                }),
                e.jsx("div", {
                  className: "space-y-0.5",
                  children: s.items.map((a) => {
                    const t = r === a.to || (a.to !== "/app" && r.startsWith(a.to)),
                      o = a.icon;
                    return e.jsxs(
                      c,
                      {
                        to: a.to,
                        className: x(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-smooth",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          t &&
                            "bg-sidebar-accent text-sidebar-accent-foreground shadow-card relative",
                        ),
                        children: [
                          t &&
                            e.jsx("span", {
                              className:
                                "absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary",
                            }),
                          e.jsx(o, {
                            className: x("h-4 w-4", t ? "text-primary" : "text-muted-foreground"),
                          }),
                          e.jsx("span", { className: "font-medium", children: a.label }),
                        ],
                      },
                      a.to,
                    );
                  }),
                }),
              ],
            },
            s.title,
          ),
        ),
      }),
      e.jsxs("div", {
        className: "m-3 rounded-xl border border-sidebar-border bg-gradient-surface p-4",
        children: [
          e.jsxs("div", {
            className: "flex items-center gap-2 text-xs font-semibold",
            children: [
              e.jsx(ae, { className: "h-4 w-4 text-primary" }),
              e.jsx("span", { children: "Plano Enterprise" }),
            ],
          }),
          e.jsx("p", {
            className: "mt-1 text-[11px] text-muted-foreground leading-snug",
            children: "Telas ilimitadas, multi-tenant e SLA 99.9%.",
          }),
          e.jsxs(c, {
            to: "/login",
            className:
              "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border bg-background/40 px-3 py-1.5 text-xs font-medium hover:bg-background/70 transition-smooth",
            children: [e.jsx(j, { className: "h-3.5 w-3.5" }), " Sair"],
          }),
        ],
      }),
    ],
  });
}
const te = {
    "/app": "Dashboard",
    "/app/monitoramento": "Monitoramento em tempo real",
    "/app/telas": "Telas / Players",
    "/app/grupos": "Grupos de telas",
    "/app/midias": "Biblioteca de mídias",
    "/app/playlists": "Playlists",
    "/app/campanhas": "Campanhas",
    "/app/agendamentos": "Agendamentos",
    "/app/preview": "Preview de campanhas",
    "/app/empresas": "Empresas",
    "/app/unidades": "Unidades",
    "/app/usuarios": "Usuários e permissões",
    "/app/relatorios": "Relatórios",
    "/app/alertas": "Alertas e falhas",
    "/app/auditoria": "Logs e auditoria",
    "/app/configuracoes": "Configurações gerais",
  },
  h = {
    admin_master: "Admin Master",
    gestor: "Gestor",
    operador: "Operador",
    visualizador: "Visualizador",
  };
function oe() {
  const { pathname: r } = y(),
    s = te[r] ?? "Signix",
    { profile: a, user: t, signOut: o } = g(),
    d = f(),
    [N, m] = i.useState(!1),
    p = i.useRef(null);
  i.useEffect(() => {
    const n = (k) => {
      p.current && !p.current.contains(k.target) && m(!1);
    };
    return (
      document.addEventListener("mousedown", n),
      () => document.removeEventListener("mousedown", n)
    );
  }, []);
  const u = a?.name ?? t?.email ?? "Usuário",
    v = u
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase(),
    w = async () => {
      (await o(), M.success("Você saiu da conta."), d({ to: "/login", replace: !0 }));
    };
  return e.jsx("header", {
    className: "sticky top-0 z-30 glass border-b border-border",
    children: e.jsxs("div", {
      className: "flex h-16 items-center gap-4 px-6",
      children: [
        e.jsxs("div", {
          className: "flex flex-col",
          children: [
            e.jsx("span", {
              className: "text-[11px] uppercase tracking-widest text-muted-foreground",
              children: "Signix · Painel",
            }),
            e.jsx("h1", {
              className: "font-display text-base font-semibold leading-none",
              children: s,
            }),
          ],
        }),
        e.jsxs("div", {
          className:
            "ml-6 hidden md:flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 w-80 max-w-full",
          children: [
            e.jsx(V, { className: "h-4 w-4 text-muted-foreground" }),
            e.jsx("input", {
              placeholder: "Buscar telas, campanhas, mídias…",
              className:
                "flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none",
            }),
            e.jsx("kbd", {
              className:
                "hidden md:inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono",
              children: "⌘K",
            }),
          ],
        }),
        e.jsxs("div", {
          className: "ml-auto flex items-center gap-2",
          children: [
            e.jsxs(c, {
              to: "/app/campanhas",
              className:
                "hidden md:inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition-smooth",
              children: [e.jsx(H, { className: "h-3.5 w-3.5" }), " Nova campanha"],
            }),
            e.jsx("button", {
              className:
                "h-9 w-9 grid place-items-center rounded-md border border-border hover:bg-surface transition-smooth",
              children: e.jsx(F, { className: "h-4 w-4 text-muted-foreground" }),
            }),
            e.jsxs(c, {
              to: "/app/alertas",
              className:
                "relative h-9 w-9 grid place-items-center rounded-md border border-border hover:bg-surface transition-smooth",
              children: [
                e.jsx(b, { className: "h-4 w-4 text-muted-foreground" }),
                e.jsx("span", {
                  className:
                    "absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background",
                }),
              ],
            }),
            e.jsxs("div", {
              ref: p,
              className: "relative ml-2",
              children: [
                e.jsxs("button", {
                  onClick: () => m((n) => !n),
                  className:
                    "flex items-center gap-2.5 rounded-lg border border-border bg-surface pl-1.5 pr-2.5 py-1 hover:bg-accent transition-smooth",
                  children: [
                    e.jsx("div", {
                      className:
                        "h-7 w-7 rounded-md bg-gradient-primary grid place-items-center text-xs font-bold text-primary-foreground",
                      children: v || "U",
                    }),
                    e.jsxs("div", {
                      className: "hidden sm:flex flex-col leading-tight text-left",
                      children: [
                        e.jsx("span", {
                          className: "text-xs font-semibold truncate max-w-[140px]",
                          children: u,
                        }),
                        e.jsx("span", {
                          className: "text-[10px] text-muted-foreground",
                          children: a ? h[a.role] : "",
                        }),
                      ],
                    }),
                    e.jsx(Q, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                  ],
                }),
                N &&
                  e.jsxs("div", {
                    className:
                      "absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-40",
                    children: [
                      e.jsxs("div", {
                        className: "px-3 py-2.5 border-b border-border",
                        children: [
                          e.jsx("p", {
                            className: "text-xs font-semibold truncate",
                            children: t?.email,
                          }),
                          e.jsx("p", {
                            className: "text-[10px] text-muted-foreground mt-0.5",
                            children: a ? h[a.role] : "Sem perfil",
                          }),
                        ],
                      }),
                      e.jsxs("button", {
                        onClick: w,
                        className:
                          "w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-surface text-left",
                        children: [e.jsx(j, { className: "h-3.5 w-3.5" }), " Sair da conta"],
                      }),
                    ],
                  }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function ne({ children: r }) {
  return e.jsxs("div", {
    className: "min-h-screen flex bg-background bg-mesh",
    children: [
      e.jsx(re, {}),
      e.jsxs("div", {
        className: "flex-1 flex flex-col min-w-0",
        children: [
          e.jsx(oe, {}),
          e.jsx("main", {
            className: "flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto",
            children: r,
          }),
        ],
      }),
    ],
  });
}
function Ce() {
  const { session: r, loading: s } = g(),
    a = f();
  return (
    i.useEffect(() => {
      !s && !r && a({ to: "/login", replace: !0 });
    }, [s, r, a]),
    s
      ? e.jsx("div", {
          className: "grid min-h-screen place-items-center bg-background",
          children: e.jsx("div", {
            className: "text-sm text-muted-foreground",
            children: "Carregando…",
          }),
        })
      : r
        ? e.jsx(ne, { children: e.jsx(A, {}) })
        : null
  );
}
export { Ce as component };

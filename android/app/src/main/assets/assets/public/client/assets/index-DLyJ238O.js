import { j as e, L as r } from "./index-DUcMANMA.js";
import { T as t } from "./tv-qkDTjJdC.js";
import { A as a } from "./arrow-right-DA0qr8cc.js";
import { M as i } from "./monitor-Ck3Yxne9.js";
import { A as l } from "./activity-CDzXOf4C.js";
import { M as o } from "./megaphone-CoxL7Qo6.js";
import { S as d } from "./shield-D870Se_j.js";
import "./createLucideIcon-BDYLgomD.js";
function u() {
  return e.jsxs("div", {
    className: "min-h-screen bg-background bg-mesh flex flex-col",
    children: [
      e.jsxs("header", {
        className: "px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full",
        children: [
          e.jsxs("div", {
            className: "flex items-center gap-2.5",
            children: [
              e.jsx("div", {
                className:
                  "h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow",
                children: e.jsx(t, { className: "h-5 w-5 text-primary-foreground" }),
              }),
              e.jsx("span", { className: "font-display text-lg font-bold", children: "Signix" }),
            ],
          }),
          e.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              e.jsx(r, {
                to: "/pareamento",
                className:
                  "hidden sm:inline-flex rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-accent transition-smooth",
                children: "Parear player",
              }),
              e.jsxs(r, {
                to: "/login",
                className:
                  "inline-flex items-center gap-1 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow",
                children: ["Acessar painel ", e.jsx(a, { className: "h-3.5 w-3.5" })],
              }),
            ],
          }),
        ],
      }),
      e.jsx("main", {
        className: "flex-1 grid place-items-center px-6",
        children: e.jsxs("div", {
          className: "max-w-3xl text-center",
          children: [
            e.jsxs("span", {
              className:
                "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs",
              children: [
                e.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-success pulse-dot" }),
                " SaaS Enterprise · Multi-tenant",
              ],
            }),
            e.jsxs("h1", {
              className:
                "mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight",
              children: [
                "Cada tela do seu negócio,",
                e.jsx("br", {}),
                e.jsx("span", {
                  className: "text-gradient",
                  children: "controlada em tempo real.",
                }),
              ],
            }),
            e.jsx("p", {
              className: "mt-5 text-base text-muted-foreground max-w-xl mx-auto",
              children:
                "Signix é a plataforma de Digital Signage para empresas que precisam orquestrar Smart TVs, Android TVs e players web em escala — com monitoramento, agendamento e relatórios.",
            }),
            e.jsxs("div", {
              className: "mt-8 flex items-center justify-center gap-3",
              children: [
                e.jsxs(r, {
                  to: "/login",
                  className:
                    "inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow",
                  children: ["Entrar no painel ", e.jsx(a, { className: "h-4 w-4" })],
                }),
                e.jsx(r, {
                  to: "/player",
                  className:
                    "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium hover:bg-accent transition-smooth",
                  children: "Ver demo do player",
                }),
              ],
            }),
            e.jsx("div", {
              className: "mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4",
              children: [
                { i, l: "Multi-dispositivo", d: "Android TV, WebOS, Tizen, web" },
                { i: l, l: "Tempo real", d: "Status e saúde de cada player" },
                { i: o, l: "Campanhas", d: "Playlists, prioridade e timeline" },
                { i: d, l: "Auditoria", d: "Logs completos e perfis de acesso" },
              ].map((s) =>
                e.jsxs(
                  "div",
                  {
                    className:
                      "rounded-xl border border-border bg-card/60 p-4 text-left shadow-card",
                    children: [
                      e.jsx(s.i, { className: "h-5 w-5 text-primary mb-2" }),
                      e.jsx("p", { className: "font-semibold text-sm", children: s.l }),
                      e.jsx("p", {
                        className: "text-[11px] text-muted-foreground mt-0.5",
                        children: s.d,
                      }),
                    ],
                  },
                  s.l,
                ),
              ),
            }),
          ],
        }),
      }),
      e.jsx("footer", {
        className: "px-6 py-6 text-center text-xs text-muted-foreground",
        children: "© 2025 Signix · Digital Signage Cloud",
      }),
    ],
  });
}
export { u as component };

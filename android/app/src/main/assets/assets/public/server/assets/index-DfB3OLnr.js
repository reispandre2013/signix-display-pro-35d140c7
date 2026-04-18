import { U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { L as Link } from "./router-BfC5KUx0.js";
import { T as Tv } from "./tv-BGJcO9c3.js";
import { A as ArrowRight } from "./arrow-right-pyLYeR4E.js";
import { M as Monitor } from "./monitor-4tjVPwPf.js";
import { A as Activity } from "./activity-jtH9nSxC.js";
import { M as Megaphone } from "./megaphone-BBmJQQfG.js";
import { S as Shield } from "./shield-HdbK2rW8.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.js";
import "./createLucideIcon-DUXbX0Xj.js";
function Landing() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background bg-mesh flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "h-5 w-5 text-primary-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg font-bold", children: "Signix" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/pareamento", className: "hidden sm:inline-flex rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-accent transition-smooth", children: "Parear player" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", className: "inline-flex items-center gap-1 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow", children: [
          "Acessar painel ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 grid place-items-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-success pulse-dot" }),
        " SaaS Enterprise · Multi-tenant"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight", children: [
        "Cada tela do seu negócio,",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient", children: "controlada em tempo real." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-base text-muted-foreground max-w-xl mx-auto", children: "Signix é a plataforma de Digital Signage para empresas que precisam orquestrar Smart TVs, Android TVs e players web em escala — com monitoramento, agendamento e relatórios." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", className: "inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow", children: [
          "Entrar no painel ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/player", className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium hover:bg-accent transition-smooth", children: "Ver demo do player" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4", children: [{
        i: Monitor,
        l: "Multi-dispositivo",
        d: "Android TV, WebOS, Tizen, web"
      }, {
        i: Activity,
        l: "Tempo real",
        d: "Status e saúde de cada player"
      }, {
        i: Megaphone,
        l: "Campanhas",
        d: "Playlists, prioridade e timeline"
      }, {
        i: Shield,
        l: "Auditoria",
        d: "Logs completos e perfis de acesso"
      }].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card/60 p-4 text-left shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(f.i, { className: "h-5 w-5 text-primary mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: f.l }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: f.d })
      ] }, f.l)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "px-6 py-6 text-center text-xs text-muted-foreground", children: "© 2025 Signix · Digital Signage Cloud" })
  ] });
}
export {
  Landing as component
};

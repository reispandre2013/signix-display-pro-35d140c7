import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { P as PageHeader } from "./PageHeader-Dkx9-OAF.js";
import { P as Panel } from "./Panel-iDal3y1F.js";
import { a as useAuth } from "./router-BfC5KUx0.js";
import { L as LogOut, B as Bell } from "./log-out-C-5renyH.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import { S as Shield } from "./shield-HdbK2rW8.js";
import { G as Globe } from "./globe-CZTrqLgi.js";
import { S as Save } from "./save-C1iXSk30.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-Bz4m9VPB.js";
import "./index-Cf78ubZ7.js";
const __iconNode$2 = [
  [
    "path",
    {
      d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",
      key: "kfwtm"
    }
  ]
];
const Moon = createLucideIcon("moon", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z",
      key: "e79jfc"
    }
  ],
  ["circle", { cx: "13.5", cy: "6.5", r: ".5", fill: "currentColor", key: "1okk4w" }],
  ["circle", { cx: "17.5", cy: "10.5", r: ".5", fill: "currentColor", key: "f64h9f" }],
  ["circle", { cx: "6.5", cy: "12.5", r: ".5", fill: "currentColor", key: "qy21gx" }],
  ["circle", { cx: "8.5", cy: "7.5", r: ".5", fill: "currentColor", key: "fotxhn" }]
];
const Palette = createLucideIcon("palette", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
];
const Sun = createLucideIcon("sun", __iconNode);
function SettingsPage() {
  const {
    profile,
    user,
    signOut
  } = useAuth();
  const [theme, setTheme] = reactExports.useState("dark");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Configurações gerais", subtitle: "Preferências do sistema, segurança e aparência." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Conta", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nome", value: profile?.name ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "E-mail", value: user?.email ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Papel", value: profile?.role ?? "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => signOut(), className: "mt-4 inline-flex items-center gap-1.5 rounded-md border border-destructive/30 text-destructive bg-destructive/10 px-3 py-1.5 text-xs font-medium hover:bg-destructive/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }),
        " Sair da conta"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Aparência", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-4 w-4 text-muted-foreground" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Escolha o tema do painel (preferência local)." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTheme("dark"), className: `rounded-lg border-2 ${theme === "dark" ? "border-primary ring-glow" : "border-border"} bg-card p-4 text-left`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-5 w-5 text-primary mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Dark (padrão)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTheme("light"), className: `rounded-lg border-2 ${theme === "light" ? "border-primary ring-glow" : "border-border"} bg-card p-4 text-left`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-5 w-5 text-warning mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Light" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Notificações", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 text-muted-foreground" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: ["Tela ficou offline", "Falha de sincronização", "Nova campanha agendada", "Resumo diário por e-mail"].map((n, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: n, on: i % 2 === 0 }, n)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Segurança", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-muted-foreground" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Autenticação em dois fatores (2FA)", on: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Forçar troca de senha a cada 90 dias" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Bloquear sessão após 30min ociosa", on: true })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Localização", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-4 w-4 text-muted-foreground" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Idioma padrão", value: "Português (Brasil)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Fuso horário", value: "America/Sao_Paulo (UTC -03:00)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Formato de data", value: "DD/MM/YYYY" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5" }),
      " Salvar configurações"
    ] }) })
  ] });
}
function Field({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1.5 block", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { readOnly: true, value, className: "w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" })
  ] });
}
function Toggle({
  label,
  on = false
}) {
  const [v, setV] = reactExports.useState(on);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border border-border bg-surface/40 px-3 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setV(!v), className: `relative h-5 w-9 rounded-full transition-colors ${v ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all ${v ? "left-4" : "left-0.5"}` }) })
  ] });
}
export {
  SettingsPage as component
};

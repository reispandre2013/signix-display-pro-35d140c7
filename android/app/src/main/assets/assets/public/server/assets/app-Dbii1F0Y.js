import { M as useRouter, U as jsxRuntimeExports, r as reactExports, _ as Outlet } from "./worker-entry-CFvqOeOX.js";
import { L as Link, a as useAuth, u as useNavigate, t as toast } from "./router-BfC5KUx0.js";
import { c as cn } from "./utils-Bz4m9VPB.js";
import { T as Tv } from "./tv-BGJcO9c3.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import { A as Activity } from "./activity-jtH9nSxC.js";
import { M as Monitor } from "./monitor-4tjVPwPf.js";
import { L as Layers } from "./layers-56A3WZ9s.js";
import { I as Image } from "./image-BY4KT0BQ.js";
import { L as ListVideo } from "./list-video-B8g0xPnR.js";
import { M as Megaphone } from "./megaphone-BBmJQQfG.js";
import { C as CalendarClock } from "./calendar-clock-X0nhAw5S.js";
import { E as Eye } from "./eye-B03_hUEz.js";
import { B as Building2 } from "./building-2-DAzKcuho.js";
import { M as MapPin } from "./map-pin-BaN5Ohl6.js";
import { U as Users } from "./users-PdhLasvr.js";
import { C as ChartColumn } from "./chart-column-DHwmBR3S.js";
import { B as Bell, L as LogOut } from "./log-out-C-5renyH.js";
import { S as ScrollText } from "./scroll-text-D2gvFEnH.js";
import { S as Search } from "./search-C6GadLXe.js";
import { P as Plus } from "./plus-BVWsQpQr.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.js";
function useLocation(opts) {
  const router = useRouter();
  {
    const location = router.stores.location.get();
    return location;
  }
}
const __iconNode$4 = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
const ChevronDown = createLucideIcon("chevron-down", __iconNode$4);
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const CircleQuestionMark = createLucideIcon("circle-question-mark", __iconNode$3);
const __iconNode$2 = [
  ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
  ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
  ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
  ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]
];
const LayoutDashboard = createLucideIcon("layout-dashboard", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Settings = createLucideIcon("settings", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
      key: "1s2grr"
    }
  ],
  ["path", { d: "M20 2v4", key: "1rf3ol" }],
  ["path", { d: "M22 4h-4", key: "gwowj6" }],
  ["circle", { cx: "4", cy: "20", r: "2", key: "6kqj1y" }]
];
const Sparkles = createLucideIcon("sparkles", __iconNode);
const sections = [
  {
    title: "Operação",
    items: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard },
      { to: "/app/monitoramento", label: "Monitoramento", icon: Activity },
      { to: "/app/telas", label: "Telas / Players", icon: Monitor },
      { to: "/app/grupos", label: "Grupos de telas", icon: Layers }
    ]
  },
  {
    title: "Conteúdo",
    items: [
      { to: "/app/midias", label: "Biblioteca de mídias", icon: Image },
      { to: "/app/playlists", label: "Playlists", icon: ListVideo },
      { to: "/app/campanhas", label: "Campanhas", icon: Megaphone },
      { to: "/app/agendamentos", label: "Agendamentos", icon: CalendarClock },
      { to: "/app/preview", label: "Preview de campanhas", icon: Eye }
    ]
  },
  {
    title: "Organização",
    items: [
      { to: "/app/empresas", label: "Empresas", icon: Building2 },
      { to: "/app/unidades", label: "Unidades", icon: MapPin },
      { to: "/app/usuarios", label: "Usuários", icon: Users }
    ]
  },
  {
    title: "Inteligência",
    items: [
      { to: "/app/relatorios", label: "Relatórios", icon: ChartColumn },
      { to: "/app/alertas", label: "Alertas e falhas", icon: Bell },
      { to: "/app/auditoria", label: "Logs / auditoria", icon: ScrollText },
      { to: "/app/configuracoes", label: "Configurações", icon: Settings }
    ]
  }
];
function Sidebar() {
  const { pathname } = useLocation();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-5 flex items-center gap-2.5 border-b border-sidebar-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "h-5 w-5 text-primary-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-sidebar pulse-dot" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col leading-tight", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg font-bold tracking-tight", children: "Signix" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-[0.2em] text-muted-foreground", children: "Digital Signage" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-6", children: sections.map((sec) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: sec.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0.5", children: sec.items.map((it) => {
        const active = pathname === it.to || it.to !== "/app" && pathname.startsWith(it.to);
        const Icon = it.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: it.to,
            className: cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-smooth",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground shadow-card relative"
            ),
            children: [
              active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: it.label })
            ]
          },
          it.to
        );
      }) })
    ] }, sec.title)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m-3 rounded-xl border border-sidebar-border bg-gradient-surface p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Plano Enterprise" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground leading-snug", children: "Telas ilimitadas, multi-tenant e SLA 99.9%." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/login",
          className: "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border bg-background/40 px-3 py-1.5 text-xs font-medium hover:bg-background/70 transition-smooth",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }),
            " Sair"
          ]
        }
      )
    ] })
  ] });
}
const breadcrumbs = {
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
  "/app/configuracoes": "Configurações gerais"
};
const roleLabel = {
  admin_master: "Admin Master",
  gestor: "Gestor",
  operador: "Operador",
  visualizador: "Visualizador"
};
function Header() {
  const { pathname } = useLocation();
  const title = breadcrumbs[pathname] ?? "Signix";
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = reactExports.useState(false);
  const ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const displayName = profile?.name ?? user?.email ?? "Usuário";
  const initials = displayName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const handleLogout = async () => {
    await signOut();
    toast.success("Você saiu da conta.");
    navigate({ to: "/login", replace: true });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 glass border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-16 items-center gap-4 px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-widest text-muted-foreground", children: "Signix · Painel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-base font-semibold leading-none", children: title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-6 hidden md:flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 w-80 max-w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          placeholder: "Buscar telas, campanhas, mídias…",
          className: "flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "hidden md:inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono", children: "⌘K" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/app/campanhas",
          className: "hidden md:inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition-smooth",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
            " Nova campanha"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "h-9 w-9 grid place-items-center rounded-md border border-border hover:bg-surface transition-smooth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "h-4 w-4 text-muted-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/app/alertas",
          className: "relative h-9 w-9 grid place-items-center rounded-md border border-border hover:bg-surface transition-smooth",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref, className: "relative ml-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setOpen((v) => !v),
            className: "flex items-center gap-2.5 rounded-lg border border-border bg-surface pl-1.5 pr-2.5 py-1 hover:bg-accent transition-smooth",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-md bg-gradient-primary grid place-items-center text-xs font-bold text-primary-foreground", children: initials || "U" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex flex-col leading-tight text-left", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold truncate max-w-[140px]", children: displayName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: profile ? roleLabel[profile.role] : "" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-muted-foreground" })
            ]
          }
        ),
        open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2.5 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold truncate", children: user?.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: profile ? roleLabel[profile.role] : "Sem perfil" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleLogout,
              className: "w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-surface text-left",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }),
                " Sair da conta"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] }) });
}
function AppShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex bg-background bg-mesh", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto", children })
    ] })
  ] });
}
function AppLayout() {
  const {
    session,
    loading
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (!loading && !session) {
      navigate({
        to: "/login",
        replace: true
      });
    }
  }, [loading, session, navigate]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Carregando…" }) });
  }
  if (!session) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
export {
  AppLayout as component
};

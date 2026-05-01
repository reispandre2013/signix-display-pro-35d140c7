import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Monitor,
  Layers,
  ImageIcon,
  ListVideo,
  Megaphone,
  CalendarClock,
  Activity,
  BarChart3,
  Users,
  Settings,
  Bell,
  ScrollText,
  Eye,
  Tv,
  Sparkles,
  CreditCard,
  Receipt,
  Shield,
} from "lucide-react";
import { SidebarPlanCallout } from "./SidebarPlanCallout";
import { cn } from "@/lib/utils";
import { useRole, type ModuleKey } from "@/lib/use-role";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; module: ModuleKey };
type Section = { title: string; items: NavItem[] };

const sections: Section[] = [
  {
    title: "Operação",
    items: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
      { to: "/app/monitoramento", label: "Monitoramento", icon: Activity, module: "monitoramento" },
      { to: "/app/telas", label: "Dispositivos", icon: Monitor, module: "telas" },
      { to: "/app/grupos", label: "Grupos de telas", icon: Layers, module: "grupos" },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { to: "/app/midias", label: "Biblioteca de mídias", icon: ImageIcon, module: "midias" },
      { to: "/app/playlists", label: "Playlists", icon: ListVideo, module: "playlists" },
      { to: "/app/campanhas", label: "Campanhas", icon: Megaphone, module: "campanhas" },
      {
        to: "/app/agendamentos",
        label: "Agendamentos",
        icon: CalendarClock,
        module: "agendamentos",
      },
      { to: "/app/preview", label: "Preview de campanhas", icon: Eye, module: "preview" },
    ],
  },
  {
    title: "Organização",
    items: [
      { to: "/app/empresas", label: "Empresas", icon: Building2, module: "empresas" },
      { to: "/app/unidades", label: "Unidades", icon: MapPin, module: "unidades" },
      { to: "/app/usuarios", label: "Usuários", icon: Users, module: "usuarios" },
    ],
  },
  {
    title: "Inteligência",
    items: [
      { to: "/app/relatorios", label: "Relatórios", icon: BarChart3, module: "relatorios" },
      { to: "/app/alertas", label: "Alertas e falhas", icon: Bell, module: "alertas" },
      { to: "/app/auditoria", label: "Logs / auditoria", icon: ScrollText, module: "auditoria" },
      { to: "/app/configuracoes", label: "Configurações", icon: Settings, module: "configuracoes" },
    ],
  },
  {
    title: "Plano & Faturas",
    items: [
      { to: "/app/assinatura", label: "Minha assinatura", icon: CreditCard, module: "assinatura" },
      { to: "/app/faturas", label: "Faturas", icon: Receipt, module: "faturas" },
    ],
  },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { can, label, isSuperAdmin } = useRole();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-sidebar-border">
        <div className="relative h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
          <Tv className="h-5 w-5 text-primary-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-sidebar pulse-dot" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-lg font-bold tracking-tight">SigPlayer</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Digital Signage
          </span>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="rounded-md border border-sidebar-border bg-background/30 px-2.5 py-1.5 flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-6">
        {isSuperAdmin && (
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              SaaS Admin
            </div>
            <div className="space-y-0.5">
              <Link
                to="/admin-saas"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-smooth bg-gradient-primary text-primary-foreground shadow-glow",
                )}
              >
                <Sparkles className="h-4 w-4" />
                <span className="font-semibold">Painel SaaS</span>
              </Link>
            </div>
          </div>
        )}

        {sections.map((sec) => {
          const visible = sec.items.filter((it) => can(it.module));
          if (visible.length === 0) return null;
          return (
            <div key={sec.title}>
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {sec.title}
              </div>
              <div className="space-y-0.5">
                {visible.map((it) => {
                  const active =
                    pathname === it.to || (it.to !== "/app" && pathname.startsWith(it.to));
                  const Icon = it.icon;
                  return (
                    <Link
                      key={it.to}
                      to={it.to}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-smooth",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        active &&
                          "bg-sidebar-accent text-sidebar-accent-foreground shadow-card relative",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary" />
                      )}
                      <Icon
                        className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")}
                      />
                      <span className="font-medium">{it.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <SidebarPlanCallout />
    </aside>
  );
}

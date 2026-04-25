import { createFileRoute, Outlet, Link, useLocation, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Sparkles, LayoutDashboard, Building2, Package, ScrollText, Receipt,
  KeyRound, CreditCard, ArrowLeft, LogOut, Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/lib/use-role";
import { hasSupabaseEnv } from "@/lib/supabase-client";
import { getCurrentSession } from "@/services/auth-service";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-saas")({
  head: () => ({ meta: [{ title: "Painel SaaS — Signix" }] }),
  beforeLoad: async () => {
    if (!hasSupabaseEnv) return;
    const session = await getCurrentSession();
    if (!session) throw redirect({ to: "/login" });
  },
  component: AdminSaasLayout,
});

const nav = [
  { to: "/admin-saas", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/admin-saas/clientes", label: "Clientes", icon: Building2 },
  { to: "/admin-saas/planos", label: "Planos", icon: Package },
  { to: "/admin-saas/assinaturas", label: "Assinaturas", icon: CreditCard },
  { to: "/admin-saas/pagamentos", label: "Pagamentos", icon: Receipt },
  { to: "/admin-saas/licencas", label: "Licenças", icon: KeyRound },
  { to: "/admin-saas/logs", label: "Logs", icon: ScrollText },
  { to: "/admin-saas/diagnostico", label: "Diagnóstico", icon: Stethoscope },
];

function AdminSaasLayout() {
  const { session, loading, signOut } = useAuth();
  const { isSuperAdmin } = useRole();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login", replace: true });
  }, [loading, session, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Carregando…</div>
      </div>
    );
  }
  if (!session) return null;

  // Em produção, bloqueia quem não é super_admin. Em mock/dev (sem env) deixa entrar para visualizar UI.
  if (hasSupabaseEnv && !isSuperAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background bg-mesh px-4">
        <div className="max-w-md text-center rounded-xl border border-border bg-card p-8 shadow-card">
          <Sparkles className="h-8 w-8 text-primary mx-auto" />
          <h1 className="font-display text-xl font-bold mt-3">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta área é exclusiva para o Super Admin da plataforma.
          </p>
          <Link to="/app" className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background bg-mesh">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-sidebar-border">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-bold tracking-tight">Signix</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary">SaaS Admin</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
          {nav.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-smooth",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  active && "bg-sidebar-accent text-sidebar-accent-foreground shadow-card relative",
                )}
              >
                {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary" />}
                <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                <span className="font-medium">{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="m-3 space-y-2">
          <button
            onClick={async () => { await signOut(); toast.success("Você saiu."); navigate({ to: "/login" }); }}
            className="w-full flex items-center gap-2 rounded-md border border-sidebar-border bg-background/20 px-3 py-2 text-xs hover:bg-background/50 transition-smooth"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-border">
          <div className="flex h-16 items-center gap-4 px-6">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-widest text-primary">Signix · SaaS</span>
              <h1 className="font-display text-base font-semibold leading-none">Administração da Plataforma</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

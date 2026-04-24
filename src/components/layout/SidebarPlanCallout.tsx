import { Link } from "@tanstack/react-router";
import { LogOut, Sparkles, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useOrgBillingContext } from "@/lib/hooks/use-saas-data";
import { useRole } from "@/lib/use-role";
import { formatPrice } from "@/types/saas";

export function SidebarPlanCallout() {
  const { isSuperAdmin } = useRole();
  const { signOut } = useAuth();
  const { data, isLoading, isMissingTables } = useOrgBillingContext();

  if (isSuperAdmin) {
    return (
      <div className="m-3 rounded-xl border border-sidebar-border bg-gradient-surface p-4">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Shield className="h-4 w-4 text-primary" />
          <span>Conta de plataforma</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
          Gestão de clientes, planos e faturas no painel administrativo.
        </p>
        <Link
          to="/admin-saas"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border bg-background/40 px-3 py-1.5 text-xs font-medium hover:bg-background/70 transition-smooth"
        >
          <Sparkles className="h-3.5 w-3.5" /> Painel SaaS
        </Link>
        <Link
          to="/login"
          onClick={async (e) => {
            e.preventDefault();
            await signOut();
          }}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border bg-background/20 px-3 py-1.5 text-[11px] font-medium hover:bg-background/50 transition-smooth"
        >
          <LogOut className="h-3 w-3" /> Sair
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="m-3 rounded-xl border border-sidebar-border bg-gradient-surface p-4 flex items-center justify-center gap-2 text-xs text-muted-foreground min-h-[100px]">
        <Loader2 className="h-4 w-4 animate-spin" />
        A carregar plano…
      </div>
    );
  }

  if (isMissingTables) {
    return (
      <div className="m-3 rounded-xl border border-dashed border-sidebar-border bg-gradient-surface p-3 text-[11px] text-muted-foreground">
        Tabelas de billing ainda não aplicadas (migrations).
        <Link to="/app/configuracoes" className="mt-1 block text-primary text-[11px]">
          Configurações
        </Link>
      </div>
    );
  }

  const sub = data?.subscription;
  const u = data?.usage;
  if (!sub || !u) {
    return (
      <div className="m-3 rounded-xl border border-sidebar-border bg-gradient-surface p-4">
        <p className="text-[11px] text-muted-foreground">Sem assinatura ativa.</p>
        <Link
          to="/planos"
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border bg-background/40 px-3 py-1.5 text-xs font-medium hover:bg-background/70 transition-smooth"
        >
          <Sparkles className="h-3.5 w-3.5" /> Ver planos
        </Link>
        <Link
          to="/login"
          onClick={async (e) => {
            e.preventDefault();
            await signOut();
          }}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border bg-background/20 px-3 py-1.5 text-[11px] font-medium"
        >
          <LogOut className="h-3 w-3" /> Sair
        </Link>
      </div>
    );
  }

  const limit = u.screens_limit >= 9999 ? "∞" : u.screens_limit;
  return (
    <div className="m-3 rounded-xl border border-sidebar-border bg-gradient-surface p-4">
      <div className="flex items-center gap-2 text-xs font-semibold">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="truncate">{sub.plan?.name ?? "Plano"}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
        {u.screens_used}/{limit} telas em uso
        {sub.amount_cents > 0 ? ` · ${formatPrice(sub.amount_cents)}/mês` : null}
      </p>
      <Link
        to="/app/assinatura"
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border bg-background/40 px-3 py-1.5 text-xs font-medium hover:bg-background/70 transition-smooth"
      >
        Gerir assinatura
      </Link>
      <Link
        to="/planos"
        className="mt-1 inline-flex w-full items-center justify-center gap-1 rounded-md bg-gradient-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-glow"
      >
        Upgrade
      </Link>
      <Link
        to="/login"
        onClick={async (e) => {
          e.preventDefault();
          await signOut();
        }}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border bg-background/20 px-3 py-1.5 text-[11px] font-medium hover:bg-background/50 transition-smooth"
      >
        <LogOut className="h-3 w-3" /> Sair
      </Link>
    </div>
  );
}

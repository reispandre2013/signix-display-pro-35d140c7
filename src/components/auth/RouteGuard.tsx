import { Link, useLocation } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useRole, type ModuleKey } from "@/lib/use-role";
import { getModuleForPath } from "@/lib/route-permissions";

interface RouteGuardProps {
  children: ReactNode;
  /** Se informado, força a checagem para um módulo específico. */
  module?: ModuleKey;
}

/**
 * Guard de página: valida se o perfil atual pode visualizar o módulo
 * correspondente à rota. Se não puder, mostra um bloco de "Acesso negado"
 * inline (sem trocar de URL) para impedir flashes de conteúdo privado.
 *
 * Use no layout /app para cobrir todas as rotas internas, ou diretamente
 * em uma página específica para granularidade extra.
 */
export function RouteGuard({ children, module }: RouteGuardProps) {
  const { pathname } = useLocation();
  const { can, isSuperAdmin } = useRole();

  // Super admin acessa tudo no /app (apesar de normalmente ser redirecionado).
  if (isSuperAdmin) return <>{children}</>;

  const target = module ?? getModuleForPath(pathname);
  if (!target) return <>{children}</>;
  if (can(target)) return <>{children}</>;

  return <AccessDeniedInline />;
}

function AccessDeniedInline() {
  return (
    <div className="grid place-items-center py-16 px-4">
      <div className="max-w-md w-full text-center rounded-2xl border border-border bg-card/80 backdrop-blur p-8 shadow-card">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
          <ShieldAlert className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="mt-5 font-display text-xl font-bold tracking-tight">
          Acesso não autorizado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você não tem permissão para acessar esta área. Entre em contato com o administrador da
          sua empresa para solicitar acesso.
        </p>
        <div className="mt-6 flex items-center justify-center">
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-smooth"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

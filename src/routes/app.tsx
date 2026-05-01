import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/lib/use-role";
import { hasSupabaseEnv } from "@/lib/supabase-client";
import { getCurrentSession } from "@/services/auth-service";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Painel — SigPlayer" }] }),
  beforeLoad: async () => {
    if (!hasSupabaseEnv) return;

    const session = await getCurrentSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const { session, user, profile, loading } = useAuth();
  const { isSuperAdmin } = useRole();
  const navigate = useNavigate();
  const [planChecked, setPlanChecked] = useState(false);

  // Bloqueio de acesso para novos cadastros públicos sem plano ativo.
  // Só libera após existir uma subscription com status='active' na organização.
  useEffect(() => {
    if (loading || !session || !user) return;
    if (isSuperAdmin) {
      setPlanChecked(true);
      return;
    }

    const requiresPlan = Boolean(
      (user.user_metadata as Record<string, unknown> | undefined)?.requires_plan,
    );
    if (!requiresPlan) {
      setPlanChecked(true);
      return;
    }

    const orgId = profile?.organization_id;
    if (!orgId) {
      // Sem organização ainda — manda para planos para concluir.
      navigate({ to: "/planos", replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("id,status")
        .eq("organization_id", orgId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        navigate({ to: "/planos", replace: true });
        return;
      }
      // Tem assinatura ativa: limpa a flag para próximas sessões não pagarem o custo do check.
      try {
        await supabase.auth.updateUser({ data: { requires_plan: false } });
      } catch {
        /* não-fatal */
      }
      setPlanChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, session, user, profile?.organization_id, isSuperAdmin, navigate]);

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login", replace: true });
    } else if (!loading && session && isSuperAdmin) {
      navigate({ to: "/admin-saas", replace: true });
    }
  }, [loading, session, isSuperAdmin, navigate]);

  if (loading || !planChecked) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Carregando…</div>
      </div>
    );
  }

  if (!session) return null;

  if (isSuperAdmin) {
    return null;
  }

  return (
    <AppShell>
      <RouteGuard>
        <Outlet />
      </RouteGuard>
    </AppShell>
  );
}

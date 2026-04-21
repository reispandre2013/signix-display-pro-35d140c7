import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth-context";
import { hasSupabaseEnv } from "@/lib/supabase-client";
import { getCurrentSession } from "@/services/auth-service";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Painel — Signix" }] }),
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
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, session, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Carregando…</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

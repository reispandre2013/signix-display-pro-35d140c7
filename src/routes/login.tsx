import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Tv, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { hasSupabaseConfig } from "@/lib/supabase-client";
import { isSafeInternalRedirect } from "@/lib/safe-redirect";
import { mapDbRole } from "@/lib/use-role";

type LoginSearch = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    redirect: typeof s.redirect === "string" && s.redirect.length > 0 ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar — SigPlayer" },
      { name: "description", content: "Acesse o painel SigPlayer de Digital Signage." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn, session, loading, profile, userRoles } = useAuth();
  const { redirect: redirectTo } = Route.useSearch();

  useEffect(() => {
    if (loading || !session) return;
    if (isSafeInternalRedirect(redirectTo)) {
      window.location.replace(redirectTo);
      return;
    }
    if (userRoles.includes("super_admin") || mapDbRole(profile?.role) === "super_admin") {
      void navigate({ to: "/admin-saas", replace: true });
      return;
    }
    void navigate({ to: "/app", replace: true });
  }, [loading, session, navigate, redirectTo, profile?.role, userRoles]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setSubmitting(true);
    const {
      error,
      profile: nextProfile,
      userRoles: nextRoles = [],
    } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      const raw = error.message ?? "";
      const msg = /invalid login credentials/i.test(raw)
        ? "E-mail ou senha incorretos. Use o e-mail em minúsculas e a senha definida ao criar o utilizador. Se o acesso foi só por convite por e-mail, conclua o link do convite antes de entrar com senha aqui."
        : raw || "Não foi possível entrar.";
      toast.error(msg);
      return;
    }
    toast.success("Bem-vindo!");
    if (isSafeInternalRedirect(redirectTo)) {
      window.location.replace(redirectTo);
    } else if (
      nextRoles.includes("super_admin") ||
      mapDbRole(nextProfile?.role) === "super_admin"
    ) {
      void navigate({ to: "/admin-saas", replace: true });
    } else {
      void navigate({ to: "/app", replace: true });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background bg-mesh">
      <div className="hidden lg:flex relative flex-col justify-between p-12 border-r border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Tv className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-xl font-bold">SigPlayer</p>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Digital Signage Cloud
            </p>
          </div>
        </div>

        <div className="relative space-y-6">
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-[1.05] tracking-tight">
            Controle <span className="text-gradient">cada tela</span>
            <br />
            do seu negócio em
            <br />
            tempo real.
          </h1>
          <p className="text-muted-foreground max-w-md">
            Gerencie playlists, campanhas e dispositivos em todas as unidades a partir de um único
            painel premium.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md pt-6">
            {[
              { v: "12k+", l: "Telas ativas" },
              { v: "99.9%", l: "Uptime SLA" },
              { v: "<2s", l: "Sincronização" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-border bg-card/60 px-3 py-3">
                <div className="font-display text-2xl font-bold text-gradient">{s.v}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-muted-foreground">
          © 2025 SigPlayer · SaaS Enterprise
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
              <Tv className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="font-display text-xl font-bold">SigPlayer</p>
          </div>
          <h2 className="font-display text-2xl font-bold">Bem-vindo de volta</h2>
          <p className="text-sm text-muted-foreground mt-1">Acesse seu painel administrativo.</p>

          {!hasSupabaseConfig() && (
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs">
              <p className="font-semibold text-destructive">Supabase não configurado</p>
              <p className="text-muted-foreground mt-1">
                Defina <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> para
                habilitar o login.
              </p>
              <Link
                to="/configurar"
                className="inline-block mt-2 text-primary font-medium hover:underline"
              >
                Configurar agora →
              </Link>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                  className="w-full rounded-lg border border-input bg-surface pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">Senha</label>
                <Link to="/recuperar-senha" className="text-xs text-primary hover:underline">
                  Esqueci a senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-input bg-surface pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition-smooth disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Entrar no painel <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

            <Link
              to="/signup"
              className="block w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-center text-sm font-medium hover:bg-accent transition-smooth"
            >
              Criar nova conta
            </Link>
            <Link
              to="/pareamento"
              className="block w-full text-center text-xs text-muted-foreground hover:text-foreground transition-smooth"
            >
              Parear um novo player →
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

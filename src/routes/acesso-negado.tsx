import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/acesso-negado")({
  head: () => ({ meta: [{ title: "Acesso não autorizado — SigPlayer" }] }),
  component: AcessoNegadoPage,
});

function AcessoNegadoPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background bg-mesh px-4">
      <div className="max-w-md w-full text-center rounded-2xl border border-border bg-card/80 backdrop-blur p-8 shadow-card">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
          <ShieldAlert className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">
          Acesso não autorizado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você não tem permissão para acessar esta área. Se você acredita que isso é um erro,
          entre em contato com o administrador da sua empresa.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-smooth"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao dashboard
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-smooth"
          >
            Entrar com outra conta
          </Link>
        </div>
      </div>
    </div>
  );
}

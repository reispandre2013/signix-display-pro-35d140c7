import sigplayerLogo from "@/assets/sigplayer-logo.png";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { Tv, Database, Key, ArrowRight, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  clearRuntimeSupabaseConfig,
  getRuntimeSupabaseAnonKey,
  getRuntimeSupabaseUrl,
  setRuntimeSupabaseConfig,
} from "@/lib/runtime-config";

export const Route = createFileRoute("/configurar")({
  head: () => ({
    meta: [
      { title: "Configurar Supabase — SigPlayer" },
      {
        name: "description",
        content: "Defina a URL e a anon key do Supabase para habilitar o login no preview.",
      },
    ],
  }),
  component: ConfigurarPage,
});

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function isValidJwt(value: string): boolean {
  // anon key é um JWT: 3 segmentos separados por ponto, começa com eyJ
  const parts = value.split(".");
  return parts.length === 3 && value.startsWith("eyJ");
}

function ConfigurarPage() {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const u = getRuntimeSupabaseUrl();
    const k = getRuntimeSupabaseAnonKey();
    if (u) setUrl(u);
    if (k) setAnonKey(k);
    setHasExisting(Boolean(u && k));
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim().replace(/\/$/, "");
    const trimmedKey = anonKey.trim();

    if (!isValidUrl(trimmedUrl)) {
      toast.error("URL inválida. Use o formato https://seu-projeto.supabase.co");
      return;
    }
    if (!isValidJwt(trimmedKey)) {
      toast.error("Anon key inválida. Deve ser um JWT (começa com eyJ e tem 3 partes).");
      return;
    }

    setSubmitting(true);
    setRuntimeSupabaseConfig(trimmedUrl, trimmedKey);
    toast.success("Configuração salva! Recarregando...");
    // Recarrega para reinicializar o cliente Supabase com as novas envs
    setTimeout(() => {
      window.location.href = "/login";
    }, 600);
  };

  const onClear = () => {
    clearRuntimeSupabaseConfig();
    setUrl("");
    setAnonKey("");
    setHasExisting(false);
    toast.success("Configuração removida. Recarregando...");
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="min-h-screen bg-background bg-mesh flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Tv className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-xl font-bold">SigPlayer</p>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Configuração de ambiente
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-elegant">
          <h1 className="font-display text-2xl font-bold">Conectar ao Supabase</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Preencha a URL do projeto e a{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">anon key</code> para habilitar o
            login. Os dados ficam salvos apenas neste navegador.
          </p>

          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground">Como obter:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Acesse o Supabase Dashboard → seu projeto</li>
              <li>Project Settings → API</li>
              <li>
                Copie <strong>Project URL</strong> e a chave <code>anon public</code>
              </li>
            </ol>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline mt-1"
            >
              Abrir Supabase Dashboard <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                VITE_SUPABASE_URL
              </label>
              <div className="relative">
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://seu-projeto.supabase.co"
                  className="w-full rounded-lg border border-input bg-surface pl-9 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                VITE_SUPABASE_ANON_KEY
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  required
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  rows={4}
                  className="w-full rounded-lg border border-input bg-surface pl-9 pr-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth resize-none"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                ⚠️ Use a chave <strong>anon public</strong>, nunca a service_role.
              </p>
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
                  Salvar e ir para o login <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {hasExisting && (
              <button
                type="button"
                onClick={onClear}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-transparent px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-smooth"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remover configuração salva
              </button>
            )}

            <Link
              to="/login"
              className="block text-center text-xs text-muted-foreground hover:text-foreground transition-smooth"
            >
              ← Voltar ao login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

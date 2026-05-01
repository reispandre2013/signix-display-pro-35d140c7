import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { useAuth } from "@/lib/auth-context";
import { useOrganization } from "@/lib/hooks/use-supabase-data";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { rotateEmployeeSignupToken } from "@/lib/server/public-signup.functions";
import { toast } from "sonner";
import {
  Bell,
  Shield,
  Globe,
  Palette,
  Save,
  Moon,
  Sun,
  LogOut,
  Copy,
  RefreshCw,
  Loader2,
  KeyRound,
} from "lucide-react";

export const Route = createFileRoute("/app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — SigPlayer" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, user, signOut } = useAuth();
  const orgQuery = useOrganization();
  const qc = useQueryClient();
  const rotateTokenFn = useServerFn(rotateEmployeeSignupToken);
  const [rotatingToken, setRotatingToken] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const org = orgQuery.data;
  const signupToken = org?.employee_signup_token ?? null;

  const copySignupToken = async () => {
    if (!signupToken) {
      toast.error("Código indisponível. Aplique a migração da base ou atualize a página.");
      return;
    }
    try {
      await navigator.clipboard.writeText(signupToken);
      toast.success("Código copiado.");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const regenerateSignupToken = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      toast.error("Sessão expirada. Entre novamente.");
      return;
    }
    setRotatingToken(true);
    try {
      const res = await rotateTokenFn({
        data: {},
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res && typeof res === "object" && "ok" in res && (res as { ok?: boolean }).ok) {
        toast.success("Novo código gerado. O anterior deixa de funcionar.");
        if (profile?.organization_id) {
          await qc.invalidateQueries({ queryKey: ["organization", profile.organization_id] });
        }
      } else {
        toast.error("Resposta inválida do servidor.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível gerar novo código.");
    } finally {
      setRotatingToken(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações gerais"
        subtitle="Preferências do sistema, segurança e aparência."
      />

      <Panel title="Conta">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Field label="Nome" value={profile?.name ?? "—"} />
          <Field label="E-mail" value={user?.email ?? "—"} />
          <Field label="Papel" value={profile?.role ?? "—"} />
        </div>
        <button
          onClick={() => signOut()}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-destructive/30 text-destructive bg-destructive/10 px-3 py-1.5 text-xs font-medium hover:bg-destructive/20"
        >
          <LogOut className="h-3.5 w-3.5" /> Sair da conta
        </button>
      </Panel>

      {profile?.role === "admin_master" ? (
        <Panel
          title="Cadastro público de colaboradores"
          actions={<KeyRound className="h-4 w-4 text-muted-foreground" />}
        >
          <p className="text-xs text-muted-foreground mb-3">
            Compartilhe este código com quem deve criar conta pela página &quot;Criar nova
            conta&quot;. Só é possível cadastrar perfis de Operador ou Visualizador com este código
            (nunca Admin Master).
          </p>
          {orgQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : signupToken ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  readOnly
                  value={signupToken}
                  className="flex-1 rounded-lg border border-input bg-surface px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void copySignupToken()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-input bg-surface px-3 py-2 text-xs font-medium hover:bg-accent"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copiar
                  </button>
                  <button
                    type="button"
                    disabled={rotatingToken}
                    onClick={() => void regenerateSignupToken()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium hover:bg-accent disabled:opacity-60"
                  >
                    {rotatingToken ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Novo código
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Ao gerar um novo código, convites antigos com o código anterior deixam de ser
                válidos.
              </p>
            </div>
          ) : (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Coluna <code className="text-xs">employee_signup_token</code> não encontrada. Execute
              a migração Supabase mais recente e recarregue esta página.
            </p>
          )}
        </Panel>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Aparência" actions={<Palette className="h-4 w-4 text-muted-foreground" />}>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Escolha o tema do painel (preferência local).
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme("dark")}
                className={`rounded-lg border-2 ${theme === "dark" ? "border-primary ring-glow" : "border-border"} bg-card p-4 text-left`}
              >
                <Moon className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-medium">Dark (padrão)</p>
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`rounded-lg border-2 ${theme === "light" ? "border-primary ring-glow" : "border-border"} bg-card p-4 text-left`}
              >
                <Sun className="h-5 w-5 text-warning mb-2" />
                <p className="text-sm font-medium">Light</p>
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Notificações" actions={<Bell className="h-4 w-4 text-muted-foreground" />}>
          <ul className="space-y-3">
            {[
              "Tela ficou offline",
              "Falha de sincronização",
              "Nova campanha agendada",
              "Resumo diário por e-mail",
            ].map((n, i) => (
              <Toggle key={n} label={n} on={i % 2 === 0} />
            ))}
          </ul>
        </Panel>

        <Panel title="Segurança" actions={<Shield className="h-4 w-4 text-muted-foreground" />}>
          <div className="space-y-3">
            <Toggle label="Autenticação em dois fatores (2FA)" on />
            <Toggle label="Forçar troca de senha a cada 90 dias" />
            <Toggle label="Bloquear sessão após 30min ociosa" on />
          </div>
        </Panel>

        <Panel title="Localização" actions={<Globe className="h-4 w-4 text-muted-foreground" />}>
          <div className="space-y-3">
            <Field label="Idioma padrão" value="Português (Brasil)" />
            <Field label="Fuso horário" value="America/Sao_Paulo (UTC -03:00)" />
            <Field label="Formato de data" value="DD/MM/YYYY" />
          </div>
        </Panel>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow">
          <Save className="h-3.5 w-3.5" /> Salvar configurações
        </button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <input
        readOnly
        value={value}
        className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function Toggle({ label, on = false }: { label: string; on?: boolean }) {
  const [v, setV] = useState(on);
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-surface/40 px-3 py-2">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => setV(!v)}
        className={`relative h-5 w-9 rounded-full transition-colors ${v ? "bg-primary" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all ${v ? "left-4" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

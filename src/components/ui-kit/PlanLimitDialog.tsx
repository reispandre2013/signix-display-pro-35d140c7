import { Link } from "@tanstack/react-router";
import { Sparkles, X, Zap, ArrowRight } from "lucide-react";
import { useEffect } from "react";

export interface PlanLimitInfo {
  used: number;
  limit: number;
  kind: "telas" | "usuários" | string;
}

/**
 * Detecta a mensagem padrão lançada por `assertCanAddScreen` / `assertCanAddUser`:
 * "Limite do plano atingido: X/Y telas. Faça upgrade em /planos."
 * "Sem assinatura ativa. Contrate um plano em /planos para adicionar telas."
 */
export function parsePlanLimitError(message: string): PlanLimitInfo | null {
  if (!message) return null;
  const m = message.match(/Limite do plano atingido:\s*(\d+)\/(\d+)\s+(\S+)/i);
  if (m) {
    return { used: Number(m[1]), limit: Number(m[2]), kind: m[3] };
  }
  if (/Sem assinatura ativa.*adicionar\s+(\S+)/i.test(message)) {
    const k = message.match(/adicionar\s+(\S+)/i)?.[1] ?? "recursos";
    return { used: 0, limit: 0, kind: k.replace(/[.,]/g, "") };
  }
  return null;
}

interface Props {
  info: PlanLimitInfo | null;
  onClose: () => void;
}

export function PlanLimitDialog({ info, onClose }: Props) {
  useEffect(() => {
    if (!info) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [info, onClose]);

  if (!info) return null;

  const noPlan = info.limit === 0;
  const title = noPlan ? "Sem assinatura ativa" : "Limite do plano atingido";
  const subtitle = noPlan
    ? `Você ainda não possui um plano ativo para adicionar ${info.kind}.`
    : `Você está usando ${info.used} de ${info.limit} ${info.kind} disponíveis no seu plano atual.`;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-limit-title"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative gradient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-40 blur-3xl"
          style={{ background: "var(--gradient-primary, hsl(var(--primary)))" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full opacity-30 blur-3xl bg-primary/40"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/60 text-muted-foreground backdrop-blur transition-colors hover:bg-background hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative px-6 pt-8 pb-6">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-glow">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>

          <h2
            id="plan-limit-title"
            className="text-center font-display text-xl font-bold tracking-tight"
          >
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
            {subtitle}
          </p>

          {!noPlan && info.limit > 0 && (
            <div className="mt-5 rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Uso atual</span>
                <span className="font-semibold">
                  {info.used}/{info.limit} {info.kind}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((info.used / info.limit) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Faça upgrade do seu plano</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Desbloqueie mais {info.kind}, recursos avançados e suporte prioritário.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              Fechar
            </button>
            <Link
              to="/planos"
              onClick={onClose}
              className="group inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              Fazer upgrade
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

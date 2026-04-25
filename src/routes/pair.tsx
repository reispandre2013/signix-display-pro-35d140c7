import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, Tv, Wifi, Monitor, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { checkPairingStatus, createPairingCode } from "@/lib/server/screens.functions";
import { activateWebPlayerByCode } from "@/lib/server/web-player.functions";

const LS_WEB_DEVICE_TOKEN = "signix_web_device_token";
const LS_WEB_SCREEN_ID = "signix_web_screen_id";
const LS_WEB_PAIRING_CODE = "signix_web_pairing_code";
const LS_WEB_PAIRING_EXP = "signix_web_pairing_exp";

export const Route = createFileRoute("/pair")({
  head: () => ({ meta: [{ title: "Pareamento Web Player — Signix" }] }),
  component: PairRouteComponent,
});

function buildFingerprint() {
  const seed = `${navigator.userAgent}|${navigator.language}|${screen.width}x${screen.height}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return `web-${Math.abs(hash)}`;
}

function PairRouteComponent() {
  const navigate = useNavigate();
  const createCodeFn = useServerFn(createPairingCode);
  const checkStatusFn = useServerFn(checkPairingStatus);
  const activateFn = useServerFn(activateWebPlayerByCode);

  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paired, setPaired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const activatedRef = useRef(false);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  const generateCode = async () => {
    setLoading(true);
    setError(null);
    setPaired(false);
    activatedRef.current = false;
    try {
      const res = await createCodeFn({ data: { platform: "web" } });
      const generatedCode = typeof res?.code === "string" ? res.code : typeof res?.pairing_code === "string" ? res.pairing_code : "";
      if (!generatedCode) throw new Error("Resposta inválida do servidor.");
      localStorage.setItem(LS_WEB_PAIRING_CODE, generatedCode);
      if (res.expires_at) localStorage.setItem(LS_WEB_PAIRING_EXP, res.expires_at);
      setCode(generatedCode);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Não foi possível gerar o código de pareamento.");
      setCode(null);
      localStorage.removeItem(LS_WEB_PAIRING_CODE);
      localStorage.removeItem(LS_WEB_PAIRING_EXP);
    } finally {
      setLoading(false);
    }
  };

  // Restaura código existente se ainda válido, senão gera um novo.
  useEffect(() => {
    const stored = localStorage.getItem(LS_WEB_PAIRING_CODE);
    const storedExp = localStorage.getItem(LS_WEB_PAIRING_EXP);
    const stillValid = stored && storedExp && new Date(storedExp).getTime() > Date.now() + 30_000;
    if (stillValid && stored) {
      setCode(stored);
      setLoading(false);
    } else {
      localStorage.removeItem(LS_WEB_PAIRING_CODE);
      localStorage.removeItem(LS_WEB_PAIRING_EXP);
      void generateCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling: aguarda admin reivindicar o código no painel
  useEffect(() => {
    if (!code || paired) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await checkStatusFn({ data: { code } });
        if (cancelled) return;
        if (res?.paired) setPaired(true);
        if (res?.expired) {
          setError("Código expirado. Gere um novo.");
        }
      } catch {
        // ignora erros transitórios
      }
    };
    void poll();
    const id = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [code, paired, checkStatusFn]);

  // Quando o admin vincula, ativa a sessão web (cria web_player_sessions + token)
  useEffect(() => {
    if (!paired || !code || activatedRef.current) return;
    activatedRef.current = true;
    setActivating(true);
    (async () => {
      try {
        const res = await activateFn({
          data: {
            pairing_code: code,
            fingerprint: buildFingerprint(),
            user_agent: navigator.userAgent,
            screen_width: window.screen.width,
            screen_height: window.screen.height,
          },
        });
        localStorage.setItem(LS_WEB_DEVICE_TOKEN, String(res.device_token));
        localStorage.setItem(LS_WEB_SCREEN_ID, String(res.screen_id));
        localStorage.removeItem(LS_WEB_PAIRING_CODE);
        localStorage.removeItem(LS_WEB_PAIRING_EXP);
        setTimeout(() => {
          void navigate({
            to: "/player/web",
            search: {
              screenId: String(res.screen_id),
              token: String(res.device_token),
              debug: undefined,
            },
          });
        }, 700);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg || "Falha ao ativar sessão web.");
        setActivating(false);
        activatedRef.current = false;
      }
    })();
  }, [paired, code, activateFn, navigate]);

  const codeChars = useMemo(() => (code ? code.split("") : []), [code]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tv className="h-5 w-5 text-primary" />
          <span className="font-display text-lg font-bold">Signix Web Player</span>
        </div>
        <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">
          Painel administrativo
        </Link>
      </header>

      <main className="flex-1 grid place-items-center px-4 py-8">
        <div className="w-full max-w-xl text-center">
          {paired ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 px-3 py-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" /> Vinculado pelo painel
              </div>
              <h1 className="mt-6 font-display text-3xl lg:text-4xl font-bold leading-tight">
                {activating ? "Ativando o player web..." : "Tudo pronto!"}
              </h1>
              <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> A iniciar a sessão web...
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Aguardando confirmação no painel
              </div>
              <h1 className="mt-6 font-display text-3xl lg:text-4xl font-bold leading-tight">
                Use este código para parear<br />o navegador como player
              </h1>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm">
                No painel acesse <span className="text-foreground font-medium">Dispositivos › Novo dispositivo</span>,
                cole o código abaixo e selecione a plataforma <span className="text-foreground font-medium">Web Player</span>.
              </p>

              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-8 py-6 shadow-lg min-h-[120px]">
                {loading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                ) : error ? (
                  <p className="max-w-sm text-sm text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                  </p>
                ) : code ? (
                  codeChars.map((c, i) =>
                    c === "-" ? (
                      <span key={i} className="font-display text-4xl text-muted-foreground">·</span>
                    ) : (
                      <span key={i} className="font-mono text-5xl font-bold text-primary w-10 text-center">
                        {c}
                      </span>
                    ),
                  )
                ) : null}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 max-w-md mx-auto text-left">
                <Info label="Internet" value={online ? "Online" : "Offline"} icon={<Wifi className="h-3.5 w-3.5" />} />
                <Info
                  label="Resolução"
                  value={`${typeof window !== "undefined" ? window.screen.width : 0}x${typeof window !== "undefined" ? window.screen.height : 0}`}
                  icon={<Monitor className="h-3.5 w-3.5" />}
                />
              </div>

              <button
                type="button"
                onClick={() => void generateCode()}
                disabled={loading}
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-accent disabled:opacity-60"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Gerar novo código
              </button>

              <p className="mt-5 text-xs text-muted-foreground">
                Dica kiosk: abra em fullscreen (`F11`) após pareado.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-md border border-border px-3 py-2 bg-card/60">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="mt-1 font-medium text-sm">{value}</p>
    </div>
  );
}

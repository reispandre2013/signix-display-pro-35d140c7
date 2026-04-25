import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, Tv, Wifi, Monitor, CheckCircle2, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { activateWebPlayer, validateWebPairing } from "@/lib/server/web-player.functions";

const LS_WEB_DEVICE_TOKEN = "signix_web_device_token";
const LS_WEB_SCREEN_ID = "signix_web_screen_id";

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
  const validateFn = useServerFn(validateWebPairing);
  const activateFn = useServerFn(activateWebPlayer);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [online, setOnline] = useState<boolean>(navigator.onLine);

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

  const normalizedCode = useMemo(
    () => code.toUpperCase().replace(/[•·‧_]/g, "-").replace(/\s+/g, ""),
    [code],
  );

  const onPair = async () => {
    if (!normalizedCode || busy) return;
    setBusy(true);
    setStatus("idle");
    setMessage("");
    try {
      const res = await validateFn({
        data: {
          pairing_code: normalizedCode,
          fingerprint: buildFingerprint(),
          user_agent: navigator.userAgent,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
        },
      });
      await activateFn({
        data: {
          screen_id: res.screen_id as string,
          device_token: res.device_token as string,
        },
      });
      localStorage.setItem(LS_WEB_DEVICE_TOKEN, String(res.device_token));
      localStorage.setItem(LS_WEB_SCREEN_ID, String(res.screen_id));
      setStatus("ok");
      setMessage("Dispositivo pareado com sucesso. A iniciar player...");
      setTimeout(() => {
        void navigate({
          to: "/player/web",
          search: { screenId: String(res.screen_id), token: String(res.device_token), debug: undefined },
        });
      }, 900);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Falha no pareamento.");
    } finally {
      setBusy(false);
    }
  };

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
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lg">
          <h1 className="text-2xl font-display font-bold">Parear dispositivo web</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Insira o código criado no painel em <strong>Dispositivos › Novo dispositivo</strong>.
          </p>

          <div className="mt-5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Código de pareamento</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ABCD-EFGH"
              className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3 font-mono text-lg tracking-widest uppercase text-center"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void onPair()}
              disabled={!normalizedCode || busy}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Tv className="h-4 w-4" />}
              Parear dispositivo
            </button>
            <button
              type="button"
              onClick={() => setCode("")}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm"
            >
              Trocar código
            </button>
          </div>

          {status !== "idle" ? (
            <div
              className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                status === "ok"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {status === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {message}
              </span>
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
            <Info label="Internet" value={online ? "Online" : "Offline"} icon={<Wifi className="h-3.5 w-3.5" />} />
            <Info
              label="Resolução"
              value={`${window.screen.width}x${window.screen.height}`}
              icon={<Monitor className="h-3.5 w-3.5" />}
            />
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            Dica kiosk: abra em fullscreen (`F11`) e use URL direta do player após parear.
          </p>
        </div>
      </main>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-md border border-border px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

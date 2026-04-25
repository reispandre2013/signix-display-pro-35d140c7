import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AlertTriangle, Loader2, RefreshCw, WifiOff } from "lucide-react";
import {
  registerWebPlaybackLog,
  webPlayerHeartbeat,
  webPlayerSync,
} from "@/lib/server/web-player.functions";
import { idbStore } from "@/player/storage/idb";

type WebPayloadItem = {
  id: string;
  playlist_item_id?: string | null;
  media_asset_id: string;
  media_type: "image" | "video" | "html" | "banner";
  media_url: string;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  position?: number;
  fit_mode?: string | null;
  fit_mode_effective?: string | null;
};

type WebPayload = {
  screen_id: string;
  organization_id: string;
  orientation?: string;
  default_fit_mode?: string;
  hide_overlay?: boolean;
  hide_controls?: boolean;
  playlist_id?: string | null;
  campaign_id?: string | null;
  etag?: string;
  sync_interval?: number;
  heartbeat_interval?: number;
  items: WebPayloadItem[];
};

const LS_WEB_DEVICE_TOKEN = "signix_web_device_token";
const LS_WEB_SCREEN_ID = "signix_web_screen_id";
const LS_WEB_DEBUG = "signix_web_debug";
const KV_PAYLOAD = "web_player_payload_v1";
const KV_ETAG = "web_player_etag_v1";

export const Route = createFileRoute("/player/web")({
  validateSearch: (raw: Record<string, unknown>) => ({
    screenId: typeof raw.screenId === "string" ? raw.screenId : undefined,
    token: typeof raw.token === "string" ? raw.token : undefined,
    debug: raw.debug === "1" ? "1" : undefined,
  }),
  head: () => ({ meta: [{ title: "Web Player — Signix" }] }),
  component: WebPlayerRoute,
});

function objectFitClass(mode: string | null | undefined): string {
  const m = (mode ?? "cover").toLowerCase();
  if (m === "contain") return "object-contain";
  if (m === "stretch") return "object-fill";
  if (m === "center") return "object-center";
  if (m === "fit-width" || m === "fit-height") return "object-contain";
  return "object-cover";
}

function fitStyle(mode: string | null | undefined): CSSProperties | undefined {
  const m = (mode ?? "cover").toLowerCase();
  if (m === "fit-width") return { width: "100%", height: "auto", maxHeight: "100%" };
  if (m === "fit-height") return { height: "100%", width: "auto", maxWidth: "100%" };
  return undefined;
}

function fingerprint() {
  const seed = `${navigator.userAgent}|${screen.width}x${screen.height}|${navigator.language}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return `fp-${Math.abs(hash)}`;
}

function WebPlayerRoute() {
  const search = Route.useSearch();
  const syncFn = useServerFn(webPlayerSync);
  const hbFn = useServerFn(webPlayerHeartbeat);
  const logFn = useServerFn(registerWebPlaybackLog);
  const [ready, setReady] = useState(false);
  const [screenId, setScreenId] = useState<string | null>(null);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [displayToken, setDisplayToken] = useState<string | null>(null);
  const [payload, setPayload] = useState<WebPayload | null>(null);
  const [idx, setIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState(search.debug === "1" || localStorage.getItem(LS_WEB_DEBUG) === "1");
  const logEventIdRef = useRef<string>("");

  const current = payload?.items?.[idx] ?? null;
  const effectiveFit = current?.fit_mode_effective ?? current?.fit_mode ?? payload?.default_fit_mode ?? "cover";

  useEffect(() => {
    const sid = search.screenId ?? localStorage.getItem(LS_WEB_SCREEN_ID);
    const persistedDeviceToken = localStorage.getItem(LS_WEB_DEVICE_TOKEN);
    const fromUrlToken = search.token ?? null;
    if (sid || fromUrlToken || persistedDeviceToken) {
      if (sid) localStorage.setItem(LS_WEB_SCREEN_ID, sid);
      if (persistedDeviceToken) localStorage.setItem(LS_WEB_DEVICE_TOKEN, persistedDeviceToken);
      setScreenId(sid ?? null);
      setDeviceToken(persistedDeviceToken);
      setDisplayToken(fromUrlToken);
      setReady(true);
      setError(null);
      return;
    }
    setError("Dispositivo não pareado. Acesse /pair para ativar este navegador.");
    setReady(true);
  }, [search.screenId, search.token]);

  const syncNow = useCallback(async () => {
    if (!screenId && !displayToken) return;
    try {
      const etag = (await idbStore.getKv<string>(KV_ETAG)) ?? null;
      const res = await syncFn({
        data: {
          screen_id: screenId ?? undefined,
          display_token: displayToken,
          device_token: deviceToken ?? undefined,
          etag,
        },
      });
      if (res?.unchanged) return;
      const next: WebPayload = {
        screen_id: String(res.screen_id ?? screenId ?? ""),
        organization_id: String(res.organization_id ?? ""),
        orientation: typeof res.orientation === "string" ? res.orientation : "horizontal",
        default_fit_mode: typeof res.default_fit_mode === "string" ? res.default_fit_mode : "cover",
        hide_overlay: res.hide_overlay !== false,
        hide_controls: res.hide_controls !== false,
        playlist_id: typeof res.playlist_id === "string" ? res.playlist_id : null,
        campaign_id: typeof res.campaign_id === "string" ? res.campaign_id : null,
        sync_interval: typeof res.sync_interval === "number" ? res.sync_interval : 90,
        heartbeat_interval: typeof res.heartbeat_interval === "number" ? res.heartbeat_interval : 60,
        etag: typeof res.etag === "string" ? res.etag : null,
        items: Array.isArray(res.items) ? (res.items as WebPayloadItem[]) : [],
      };
      setPayload(next);
      setIdx((cur) => (next.items.length ? Math.min(cur, next.items.length - 1) : 0));
      await idbStore.setKv(KV_PAYLOAD, next);
      if (next.etag) await idbStore.setKv(KV_ETAG, next.etag);
      setError(null);
    } catch (err) {
      const cached = await idbStore.getKv<WebPayload>(KV_PAYLOAD);
      if (cached) {
        setPayload(cached);
        setError("Sem conexão com servidor. Reprodução offline da última playlist válida.");
      } else {
        setError(err instanceof Error ? err.message : "Falha de sincronização.");
      }
    }
  }, [screenId, displayToken, deviceToken, syncFn]);

  useEffect(() => {
    if (!screenId && !displayToken) return;
    void syncNow();
    const t = setInterval(() => void syncNow(), Math.max(15, payload?.sync_interval ?? 90) * 1000);
    return () => clearInterval(t);
  }, [screenId, displayToken, deviceToken, syncNow, payload?.sync_interval]);

  useEffect(() => {
    if (!screenId || !deviceToken) return;
    const send = () =>
      void hbFn({
        data: {
          screen_id: screenId,
          device_token: deviceToken,
          browser: navigator.userAgent,
          user_agent: navigator.userAgent,
          width: window.innerWidth,
          height: window.innerHeight,
          online: navigator.onLine,
          playlist_id: payload?.playlist_id ?? null,
          media_asset_id: current?.media_asset_id ?? null,
          player_version: "web-1.0.0",
          last_error: error,
        },
      });
    send();
    const hb = setInterval(() => send(), Math.max(20, payload?.heartbeat_interval ?? 60) * 1000);
    return () => clearInterval(hb);
  }, [screenId, deviceToken, hbFn, payload?.heartbeat_interval, payload?.playlist_id, current?.media_asset_id, error]);

  useEffect(() => {
    if (!payload?.items?.length || !current) return;
    if (current.media_type === "video") return;
    const sec = Math.max(4, Number(current.duration_seconds ?? 8));
    const timer = setTimeout(() => setIdx((i) => (payload.items.length ? (i + 1) % payload.items.length : 0)), sec * 1000);
    return () => clearTimeout(timer);
  }, [payload, current, idx]);

  const writeLog = useCallback(
    async (status: "started" | "ended" | "failed", duration?: number, errMsg?: string) => {
      if (!screenId || !deviceToken || !current) return;
      if (status === "started") {
        logEventIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      }
      await idbStore.setLog({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        screen_id: screenId,
        device_token: deviceToken,
        local_event_id: logEventIdRef.current || `${Date.now()}-fallback`,
        media_asset_id: current.media_asset_id,
        playlist_id: payload?.playlist_id ?? null,
        campaign_id: payload?.campaign_id ?? null,
        playback_status: status,
        duration_played: duration ?? null,
        error_message: errMsg ?? null,
      });
    },
    [screenId, deviceToken, current, payload?.playlist_id, payload?.campaign_id],
  );

  useEffect(() => {
    const flush = async () => {
      const rows = await idbStore.getAllLogs<Record<string, unknown> & { id: string }>();
      for (const row of rows) {
        try {
          await logFn({ data: row });
          await idbStore.deleteLog(row.id);
        } catch {
          break;
        }
      }
    };
    void flush();
    const t = setInterval(() => void flush(), 15000);
    return () => clearInterval(t);
  }, [logFn]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.ctrlKey && e.key.toLowerCase() === "d") {
        setDebug((v) => {
          const next = !v;
          localStorage.setItem(LS_WEB_DEBUG, next ? "1" : "0");
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/web-player-sw.js").catch(() => undefined);
  }, []);

  const onVideoEnded = async () => {
    await writeLog("ended");
    if (payload?.items?.length) setIdx((i) => (i + 1) % payload.items.length);
  };

  const mediaNode = useMemo(() => {
    if (!current) return null;
    const cls = `w-full h-full ${objectFitClass(effectiveFit)}`;
    const style = fitStyle(effectiveFit);
    if (current.media_type === "video") {
      return (
        <video
          key={current.id}
          src={current.media_url}
          className={cls}
          style={style}
          autoPlay
          muted
          playsInline
          preload="auto"
          loop={false}
          onPlay={() => void writeLog("started")}
          onEnded={() => void onVideoEnded()}
          onError={() => void writeLog("failed", null, "Erro de vídeo")}
        />
      );
    }
    if (current.media_type === "html") {
      return (
        <iframe
          key={current.id}
          src={current.media_url}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-popups"
          onLoad={() => void writeLog("started")}
          title="Conteúdo HTML"
        />
      );
    }
    return (
      <img
        key={current.id}
        src={current.media_url}
        className={cls}
        style={style}
        alt=""
        onLoad={() => void writeLog("started")}
        onError={() => void writeLog("failed", null, "Erro de imagem")}
      />
    );
  }, [current, effectiveFit, writeLog, payload?.items?.length]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-black text-white">
        <Loader2 className="h-12 w-12 animate-spin text-white/70" />
      </div>
    );
  }

  if (error && !payload) {
    return (
      <div className="min-h-screen grid place-items-center bg-black text-white p-6">
        <div className="max-w-lg text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-amber-400" />
          <p className="mt-3">{error}</p>
          <a href="/pair" className="mt-4 inline-block rounded-lg border border-white/20 px-4 py-2 text-sm">
            Ir para pareamento
          </a>
        </div>
      </div>
    );
  }

  if (!payload || payload.items.length === 0) {
    return (
      <div className="min-h-screen grid place-items-center bg-black text-white p-6">
        <div className="max-w-lg text-center">
          <WifiOff className="h-12 w-12 mx-auto text-white/50" />
          <p className="mt-3 text-lg">Sem conteúdo ativo para esta tela</p>
          <button
            type="button"
            onClick={() => void syncNow()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/25 px-4 py-2 text-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Tentar sincronizar
          </button>
        </div>
      </div>
    );
  }

  const showOverlay = payload.hide_overlay !== true;
  const showControls = payload.hide_controls !== true;

  return (
    <div className="min-h-screen w-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0">{mediaNode}</div>
      {showOverlay && <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />}
      {showControls && (
        <div className="fixed inset-x-0 bottom-0 px-4 py-3 text-xs text-white/80 flex items-center justify-between bg-black/30 backdrop-blur">
          <span>
            Item {idx + 1}/{payload.items.length}
          </span>
          <span>{navigator.onLine ? "online" : "offline"}</span>
        </div>
      )}

      {debug ? (
        <div className="fixed top-3 left-3 rounded-lg border border-white/20 bg-black/70 px-3 py-2 text-[11px] leading-relaxed">
          <div><strong>screen_id:</strong> {screenId}</div>
          <div><strong>playlist:</strong> {payload.playlist_id ?? "—"}</div>
          <div><strong>campaign:</strong> {payload.campaign_id ?? "—"}</div>
          <div><strong>sync:</strong> {payload.sync_interval ?? 90}s</div>
          <div><strong>heartbeat:</strong> {payload.heartbeat_interval ?? 60}s</div>
          <div><strong>conn:</strong> {navigator.onLine ? "online" : "offline"}</div>
          {error ? <div className="text-amber-300"><strong>erro:</strong> {error}</div> : null}
          <div className="mt-1 text-[10px] text-white/60">Ctrl+Shift+D para ocultar</div>
        </div>
      ) : null}
      {error && payload ? (
        <div className="fixed top-3 right-3 rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-1 text-[11px] text-amber-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}

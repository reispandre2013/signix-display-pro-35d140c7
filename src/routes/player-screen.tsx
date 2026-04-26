import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  getScreenPlaylistPayload,
  postPlayerHeartbeat,
  postPlayerSyncAck,
  type ScreenPlaylistItem,
} from "@/lib/server/player.functions";
import { getMediaUrlCandidates, applyMediaFallback } from "@/lib/media-url";
import { initAndroidTvShell } from "@/player/capacitor/android-shell";
import {
  PLAYER_LS_AUTH_TOKEN,
  PLAYER_LS_DEVICE_ID,
  PLAYER_LS_PAIRING_CODE,
  PLAYER_LS_SCREEN_ID,
} from "@/player/player-storage-keys";
import { resetDevicePairing } from "@/player/services/player-api";
import { Tv, Wifi, AlertCircle, Loader2, KeyRound } from "lucide-react";

const LS_CODE = PLAYER_LS_PAIRING_CODE;
const LS_SCREEN = PLAYER_LS_SCREEN_ID;

export const Route = createFileRoute("/player-screen")({
  head: () => ({ meta: [{ title: "Player — Signix" }] }),
  validateSearch: (raw: Record<string, unknown>) => {
    const p = raw.platform;
    const platform = p === "tizen" || p === "android" ? p : undefined;
    return { platform } as { platform?: "android" | "tizen" };
  },
  component: PlayerScreenPage,
});

type PayloadOk = {
  ok: true;
  unchanged?: boolean;
  etag: string;
  server_time: string;
  screen?: {
    id: string;
    name: string;
    organization_id: string;
    hide_overlay?: boolean;
    hide_controls?: boolean;
    default_fit_mode?: string;
    orientation?: string;
    resolution?: string | null;
  };
  campaign?: { id: string; name: string; playlist_id: string; priority: number } | null;
  playlist?: { id: string; name: string; version?: number } | null;
  playlist_version?: number | null;
  items?: ScreenPlaylistItem[];
  source?: string;
  resolution_source?: string;
};

function tailwindObjectFit(fit: string | undefined): string {
  const f = (fit ?? "cover").toLowerCase();
  if (f === "contain") return "object-contain";
  if (f === "stretch") return "object-fill";
  if (f === "center") return "object-center";
  if (f === "fit-width" || f === "fit-height") return "object-contain";
  return "object-cover";
}

function inlineFitStyle(fit: string | undefined): CSSProperties | undefined {
  const f = (fit ?? "cover").toLowerCase();
  if (f === "fit-width") return { width: "100%", height: "auto", maxHeight: "100%" };
  if (f === "fit-height") return { height: "100%", width: "auto", maxWidth: "100%" };
  return undefined;
}

function PlayerScreenPage() {
  const { platform: platformSearch } = Route.useSearch();
  const platform = platformSearch === "tizen" ? "tizen" : "android";

  const getPayloadFn = useServerFn(getScreenPlaylistPayload);
  const heartbeatFn = useServerFn(postPlayerHeartbeat);
  const syncAckFn = useServerFn(postPlayerSyncAck);

  useEffect(() => {
    void initAndroidTvShell();
  }, []);

  const [screenId, setScreenId] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [rotateBusy, setRotateBusy] = useState(false);
  const [items, setItems] = useState<ScreenPlaylistItem[]>([]);
  const [campaignLabel, setCampaignLabel] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [idx, setIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const etagRef = useRef<string | null>(null);
  const [hideOverlay, setHideOverlay] = useState(true);
  const [hideControls, setHideControls] = useState(true);

  useEffect(() => {
    const sid = localStorage.getItem(LS_SCREEN);
    const code = localStorage.getItem(LS_CODE);
    const did = localStorage.getItem(PLAYER_LS_DEVICE_ID);
    const tok = localStorage.getItem(PLAYER_LS_AUTH_TOKEN);
    setScreenId(sid);
    setPairingCode(code);
    setDeviceId(did);
    setAuthToken(tok);
    const canPlay = Boolean(sid && (code || (did && tok)));
    if (!canPlay) {
      setError("Faça o pareamento primeiro e volte aqui (código e tela gravados neste aparelho).");
    }
  }, []);

  const pullPlaylist = useCallback(async () => {
    const sid = screenId ?? localStorage.getItem(LS_SCREEN);
    const code = localStorage.getItem(LS_CODE);
    const did = localStorage.getItem(PLAYER_LS_DEVICE_ID);
    const tok = localStorage.getItem(PLAYER_LS_AUTH_TOKEN);
    const useDevice = Boolean(did && tok);
    if (!sid || (!code && !useDevice)) return;
    setError(null);
    try {
      const res = (await getPayloadFn({
        data: useDevice
          ? {
              screen_id: sid,
              device_id: did as string,
              auth_token: tok as string,
              platform,
              etag: etagRef.current,
            }
          : {
              screen_id: sid,
              pairing_code: code as string,
              platform,
              etag: etagRef.current,
            },
      })) as PayloadOk;

      if (!res?.ok) throw new Error("Resposta inválida do servidor.");

      if (res.unchanged) return;

      etagRef.current = res.etag;
      const nextItems = res.items ?? [];
      setItems(nextItems);
      setCampaignLabel(res.campaign?.name ?? "");
      setSource(res.source ?? "");
      if (res.screen) {
        setHideOverlay(res.screen.hide_overlay !== false);
        setHideControls(res.screen.hide_controls !== false);
      }
      setIdx((i) => (nextItems.length === 0 ? 0 : Math.min(i, nextItems.length - 1)));

      const syncBase = useDevice
        ? {
            screen_id: sid,
            device_id: did as string,
            auth_token: tok as string,
            platform,
          }
        : { screen_id: sid, pairing_code: code as string, platform };

      await syncAckFn({
        data: {
          ...syncBase,
          sync_type: "playlist_pull",
          sync_status: nextItems.length > 0 ? "success" : "partial",
          items_downloaded: nextItems.length,
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao sincronizar.");
      const sid2 = screenId ?? localStorage.getItem(LS_SCREEN);
      const code2 = localStorage.getItem(LS_CODE);
      const did2 = localStorage.getItem(PLAYER_LS_DEVICE_ID);
      const tok2 = localStorage.getItem(PLAYER_LS_AUTH_TOKEN);
      const useDev2 = Boolean(did2 && tok2);
      if (sid2 && (code2 || useDev2)) {
        try {
          const failBase = useDev2
            ? {
                screen_id: sid2,
                device_id: did2 as string,
                auth_token: tok2 as string,
                platform,
              }
            : { screen_id: sid2, pairing_code: code2 as string, platform };
          await syncAckFn({
            data: {
              ...failBase,
              sync_type: "playlist_pull",
              sync_status: "failed",
              error_message: e instanceof Error ? e.message : String(e),
            },
          });
        } catch {
          /* ignore */
        }
      }
    } finally {
      setInitialSyncDone(true);
    }
  }, [screenId, platform, getPayloadFn, syncAckFn]);

  const canSync = Boolean(screenId && (pairingCode || (deviceId && authToken)));

  useEffect(() => {
    if (!canSync) return;
    void pullPlaylist();
    const t = setInterval(() => void pullPlaylist(), 90_000);
    return () => clearInterval(t);
  }, [canSync, pullPlaylist]);

  useEffect(() => {
    if (!canSync || items.length === 0) return;
    const cur = items[idx];
    const mime = (cur?.mime_type ?? "").toLowerCase();
    const isVid = cur?.media_type === "video" || mime.includes("video");
    if (isVid) return;
    const dur = Math.max(5, (cur?.duration_seconds ?? 8) as number);
    const timer = setInterval(() => setIdx((i) => (i + 1) % items.length), dur * 1000);
    return () => clearInterval(timer);
  }, [items, idx, canSync]);

  useEffect(() => {
    if (!canSync) return;
    const useDevice = Boolean(deviceId && authToken);
    const send = () => {
      const cur = items[idx];
      const base = useDevice
        ? {
            screen_id: screenId as string,
            device_id: deviceId as string,
            auth_token: authToken as string,
            platform,
          }
        : {
            screen_id: screenId as string,
            pairing_code: pairingCode as string,
            platform,
          };
      void heartbeatFn({
        data: {
          ...base,
          player_status: "playing",
          current_media_id: cur?.id ?? null,
        },
      });
    };
    send();
    const h = setInterval(send, 60_000);
    return () => clearInterval(h);
  }, [canSync, screenId, pairingCode, deviceId, authToken, platform, items, idx, heartbeatFn]);

  const onRotatePairing = useCallback(async () => {
    if (!deviceId || !authToken) return;
    setRotateBusy(true);
    setError(null);
    try {
      const r = await resetDevicePairing(deviceId, authToken);
      localStorage.removeItem(PLAYER_LS_AUTH_TOKEN);
      localStorage.setItem(LS_CODE, r.pairing_code);
      localStorage.setItem(PLAYER_LS_DEVICE_ID, r.device_id);
      setAuthToken(null);
      setPairingCode(r.pairing_code);
      setDeviceId(r.device_id);
      etagRef.current = null;
      setInitialSyncDone(false);
      await pullPlaylist();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao gerar novo código.");
    } finally {
      setRotateBusy(false);
    }
  }, [deviceId, authToken, pullPlaylist]);

  const current = items[idx];
  const urls = current
    ? getMediaUrlCandidates(
        {
          mediaTypeHint: (current?.mime_type ?? "").toLowerCase().includes("video")
            ? "video"
            : "image",
        },
        current.public_url,
        current.thumbnail_url,
      )
    : [];
  const isVideo =
    current?.media_type === "video" || (current?.mime_type ?? "").toLowerCase().includes("video");
  const effectiveFit = (current?.fit_mode_effective ?? current?.fit_mode ?? "cover") as string;
  const ofit = tailwindObjectFit(effectiveFit);
  const fitStyle = inlineFitStyle(effectiveFit);

  if (canSync && !initialSyncDone) {
    return (
      <div className="min-h-screen w-screen bg-black text-white grid place-items-center">
        <Loader2 className="h-12 w-12 animate-spin text-white/60" aria-label="A sincronizar" />
      </div>
    );
  }

  if (!canSync) {
    return (
      <div className="min-h-screen w-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-8">
        <AlertCircle className="h-12 w-12 text-amber-400" />
        <p className="text-center max-w-md text-sm text-white/80">{error}</p>
        <Link
          to="/pareamento"
          search={{ platform: platform === "tizen" ? "tizen" : undefined }}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
        >
          Ir para pareamento
        </Link>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="min-h-screen w-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-destructive-foreground text-sm">{error}</p>
        <button
          type="button"
          onClick={() => void pullPlaylist()}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen w-screen bg-black text-white grid place-items-center p-8">
        <div className="text-center max-w-lg">
          <Tv className="h-14 w-14 mx-auto text-white/40" />
          <p className="mt-4 text-lg">Sem conteúdo para esta tela</p>
          <p className="mt-2 text-sm text-white/60">
            Crie uma campanha <strong>ativa</strong> com alvo nesta tela (ou na sua unidade) e
            associe uma playlist com itens, ou adicione mídias na organização — enquanto não houver
            itens, usamos mídias ativas como fallback.
          </p>
          {!hideControls && <p className="mt-3 text-xs text-white/40">Origem: {source || "—"}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
      <div className="absolute inset-0">
        {isVideo && urls[0] ? (
          <video
            key={current!.id}
            className={`w-full h-full ${ofit}`}
            style={fitStyle}
            src={urls[0]}
            autoPlay
            muted
            playsInline
            onEnded={() => setIdx((i) => (i + 1) % items.length)}
          />
        ) : (
          <img
            src={urls[0] ?? ""}
            data-sources={JSON.stringify(urls)}
            data-source-index="0"
            alt={current?.name}
            className={`w-full h-full ${ofit}`}
            style={fitStyle}
            referrerPolicy="no-referrer"
            onError={(e) => applyMediaFallback(e.currentTarget)}
          />
        )}
        {!hideOverlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        )}
      </div>

      {!hideControls && (
        <div className="relative flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-2 rounded-full bg-black/50 backdrop-blur px-3 py-1.5 text-xs">
            <Tv className="h-4 w-4" />
            <span className="font-medium">Signix</span>
            <span className="text-white/50">·</span>
            <span className="truncate max-w-[40vw]">{campaignLabel || "Conteúdo"}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/80">
            <Wifi className="h-3.5 w-3.5" />
            {navigator.onLine ? "Online" : "Offline"}
            <span className="text-white/40">·</span>
            <span className="uppercase">{platform}</span>
          </div>
        </div>
      )}

      {!hideControls && (
        <div className="relative mt-auto p-4 flex items-center justify-between text-[11px] text-white/50">
          <span>
            {idx + 1}/{items.length} · {source}
          </span>
          <span className="flex items-center gap-2">
            {deviceId && authToken ? (
              <button
                type="button"
                disabled={rotateBusy}
                onClick={() => void onRotatePairing()}
                className="inline-flex items-center gap-1 rounded border border-white/25 px-2 py-1 hover:bg-white/10 disabled:opacity-50"
              >
                <KeyRound className="h-3 w-3" />
                {rotateBusy ? "…" : "Novo código"}
              </button>
            ) : null}
            <Link
              to="/pareamento"
              search={{ platform: platform === "tizen" ? "tizen" : undefined }}
              className="hover:text-white"
            >
              Re-parear
            </Link>
          </span>
        </div>
      )}
    </div>
  );
}

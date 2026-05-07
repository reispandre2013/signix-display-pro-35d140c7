import { useEffect, useRef, useState } from "react";
import Hls, { type ErrorData } from "hls.js";
import { supabase } from "@/integrations/supabase/client";
import { Radio } from "lucide-react";

type RadioRow = {
  screen_id: string;
  radio_name: string;
  stream_url: string;
  volume: number;
  is_active: boolean;
};

interface Props {
  screenId: string;
  hideIndicator?: boolean;
}

/**
 * Player de rádio em background. Toca em paralelo à playlist visual sem
 * interferir em vídeos, imagens ou timers. Sincroniza por Realtime.
 */
export function BackgroundRadioPlayer({ screenId, hideIndicator }: Props) {
  const [radio, setRadio] = useState<RadioRow | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const reconnectTimer = useRef<number | null>(null);

  // Fetch inicial + Realtime
  useEffect(() => {
    let alive = true;

    const load = async () => {
      const { data } = await supabase
        .from("radio_streams")
        .select("screen_id, radio_name, stream_url, volume, is_active")
        .eq("screen_id", screenId)
        .maybeSingle();
      if (!alive) return;
      setRadio((data as RadioRow | null) ?? null);
    };
    void load();

    const channel = supabase
      .channel(`radio_streams:${screenId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "radio_streams", filter: `screen_id=eq.${screenId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setRadio(null);
          } else {
            setRadio(payload.new as RadioRow);
          }
        },
      )
      .subscribe();

    return () => {
      alive = false;
      void supabase.removeChannel(channel);
    };
  }, [screenId]);

  // Aplica radio ao <audio>
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Cleanup helpers
    const stopHls = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
    const clearReconnect = () => {
      if (reconnectTimer.current) {
        window.clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    if (!radio || !radio.is_active || !radio.stream_url) {
      stopHls();
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setStatus("idle");
      clearReconnect();
      return;
    }

    audio.volume = Math.max(0, Math.min(1, radio.volume ?? 0.8));

    const isHls = /\.m3u8(\?|$)/i.test(radio.stream_url);
    const tryPlay = () => {
      const p = audio.play();
      if (p && typeof p.catch === "function") {
        p.then(() => setStatus("playing")).catch(() => setStatus("error"));
      } else {
        setStatus("playing");
      }
    };

    setStatus("loading");
    stopHls();

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: false, enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(radio.stream_url);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
      hls.on(Hls.Events.ERROR, (_event: string, data: ErrorData) => {
        if (data.fatal) {
          setStatus("error");
          // tenta reconectar em 5s
          clearReconnect();
          reconnectTimer.current = window.setTimeout(() => {
            try {
              hls.startLoad();
              tryPlay();
            } catch {
              /* ignore */
            }
          }, 5000);
        }
      });
    } else {
      // MP3/AAC nativo (Safari/iOS também faz HLS nativo)
      audio.src = radio.stream_url;
      audio.load();
      tryPlay();
    }

    const onError = () => {
      setStatus("error");
      clearReconnect();
      reconnectTimer.current = window.setTimeout(() => {
        try {
          audio.load();
          tryPlay();
        } catch {
          /* ignore */
        }
      }, 5000);
    };
    const onPlaying = () => setStatus("playing");
    const onStalled = () => {
      // Buffer travou: tenta reconectar após 8s
      clearReconnect();
      reconnectTimer.current = window.setTimeout(() => {
        try {
          audio.load();
          tryPlay();
        } catch {
          /* ignore */
        }
      }, 8000);
    };

    audio.addEventListener("error", onError);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("stalled", onStalled);

    return () => {
      audio.removeEventListener("error", onError);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("stalled", onStalled);
      stopHls();
      clearReconnect();
    };
  }, [radio]);

  return (
    <>
      <audio
        ref={audioRef}
        autoPlay
        preload="auto"
        // não usar controls — é background
        style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
      />
      {!hideIndicator && radio?.is_active && (
        <div className="pointer-events-none absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur px-3 py-1.5 text-xs text-white">
          <Radio className="h-3.5 w-3.5 text-primary" />
          <span className="max-w-[200px] truncate">{radio.radio_name}</span>
          <span
            className={`h-2 w-2 rounded-full ${
              status === "playing"
                ? "bg-emerald-400 animate-pulse"
                : status === "loading"
                ? "bg-amber-400 animate-pulse"
                : status === "error"
                ? "bg-red-500"
                : "bg-white/40"
            }`}
          />
        </div>
      )}
    </>
  );
}

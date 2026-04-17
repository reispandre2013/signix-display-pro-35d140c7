import { RotateCcw, RefreshCw, Trash2, Bug, Power } from "lucide-react";
import { idbStore } from "@/player/storage/idb";
import type { PlayerSettings } from "@/player/types";

interface AdminOverlayProps {
  visible: boolean;
  online: boolean;
  version: string;
  lastSyncAt: string | null;
  lastError: string | null;
  settings: PlayerSettings;
  onSettingsChange: (settings: PlayerSettings) => void;
  onSync: () => void;
  onRestart: () => void;
}

export function AdminOverlay({
  visible,
  online,
  version,
  lastSyncAt,
  lastError,
  settings,
  onSettingsChange,
  onSync,
  onRestart,
}: AdminOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed right-4 top-4 z-20 w-[320px] rounded-xl border border-white/20 bg-black/70 p-4 text-white backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Painel Administrativo</h2>
        <Bug className="h-4 w-4 text-white/70" />
      </div>
      <div className="space-y-2 text-xs">
        <p>Status rede: {online ? "online" : "offline"}</p>
        <p>Versão: {version}</p>
        <p>Último sync: {lastSyncAt ? new Date(lastSyncAt).toLocaleString("pt-BR") : "nunca"}</p>
        <p>Último erro: {lastError ?? "sem erros"}</p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <label className="block">
          Heartbeat (s)
          <input
            type="number"
            min={10}
            value={settings.heartbeatSeconds}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                heartbeatSeconds: Math.max(10, Number(e.currentTarget.value || "10")),
              })
            }
            className="mt-1 w-full rounded border border-white/25 bg-black/40 px-2 py-1 text-white"
          />
        </label>
        <label className="block">
          Sync (s)
          <input
            type="number"
            min={20}
            value={settings.syncSeconds}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                syncSeconds: Math.max(20, Number(e.currentTarget.value || "20")),
              })
            }
            className="mt-1 w-full rounded border border-white/25 bg-black/40 px-2 py-1 text-white"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSync}
          className="inline-flex items-center justify-center gap-1 rounded border border-white/30 px-2 py-2 text-xs hover:bg-white/10"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Re-sync
        </button>
        <button
          type="button"
          onClick={async () => {
            await idbStore.clearMedia();
          }}
          className="inline-flex items-center justify-center gap-1 rounded border border-white/30 px-2 py-2 text-xs hover:bg-white/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Limpar cache
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-1 rounded border border-white/30 px-2 py-2 text-xs hover:bg-white/10"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reiniciar
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-1 rounded border border-red-400/45 px-2 py-2 text-xs text-red-200 hover:bg-red-500/20"
        >
          <Power className="h-3.5 w-3.5" />
          Reset pareamento
        </button>
      </div>
    </div>
  );
}

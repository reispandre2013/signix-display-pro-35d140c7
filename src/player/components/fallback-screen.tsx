import { AlertTriangle, RefreshCw } from "lucide-react";
import { PLAYER_FALLBACK_MESSAGE } from "@/player/config";

interface FallbackScreenProps {
  message?: string | null;
  onRetry: () => void;
}

export function FallbackScreen({ message, onRetry }: FallbackScreenProps) {
  return (
    <div className="min-h-screen bg-black text-white grid place-items-center px-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-white/5 p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-300" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Modo fallback ativo</h1>
        <p className="mt-3 text-white/75">{message || PLAYER_FALLBACK_MESSAGE}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/25 px-4 py-2 text-sm hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar sincronizar novamente
        </button>
      </div>
    </div>
  );
}

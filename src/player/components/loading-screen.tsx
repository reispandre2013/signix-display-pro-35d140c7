import { Loader2, Tv } from "lucide-react";

interface LoadingScreenProps {
  title?: string;
  connectionLabel: string;
  syncLabel: string;
}

export function LoadingScreen({
  title = "Carregando programação",
  connectionLabel,
  syncLabel,
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-black text-white grid place-items-center px-6">
      <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-white/5 p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
          <Tv className="h-7 w-7" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-white/70">
          Sincronizando conteúdos para exibição contínua...
        </p>
        <div className="mt-8 space-y-3 text-left text-sm">
          <div className="flex items-center justify-between rounded-lg border border-white/15 px-4 py-3">
            <span>Status da conexão</span>
            <span className="text-white/70">{connectionLabel}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/15 px-4 py-3">
            <span>Status da sincronização</span>
            <span className="text-white/70">{syncLabel}</span>
          </div>
        </div>
        <Loader2 className="mx-auto mt-7 h-7 w-7 animate-spin text-white/80" />
      </div>
    </div>
  );
}

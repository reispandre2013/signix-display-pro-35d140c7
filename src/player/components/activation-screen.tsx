import { useMemo, useState } from "react";
import { QrCode, Tv, Wifi, AlertCircle } from "lucide-react";

interface ActivationScreenProps {
  onActivate: (code: string) => Promise<void>;
  loading: boolean;
  online: boolean;
  errorMessage: string | null;
}

export function ActivationScreen({
  onActivate,
  loading,
  online,
  errorMessage,
}: ActivationScreenProps) {
  const [code, setCode] = useState("");
  const normalizedCode = useMemo(() => code.trim().toUpperCase(), [code]);
  const qrValue = normalizedCode || "PAREAMENTO-SIGNIX";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrValue)}`;

  return (
    <div className="min-h-screen bg-black text-white grid place-items-center px-6">
      <div className="w-full max-w-4xl rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-8 md:p-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
              <Tv className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Ativação do Player</h1>
              <p className="text-sm text-white/70">Vincule esta tela ao painel administrativo.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-xs">
            <Wifi className="h-3.5 w-3.5" />
            {online ? "Conectado" : "Offline"}
          </span>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_220px]">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest text-white/60">
              Código de pareamento
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.currentTarget.value)}
              placeholder="ABCD-1234"
              className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-xl font-mono tracking-wider outline-none focus:border-white/60"
            />
            <button
              type="button"
              onClick={() => onActivate(normalizedCode)}
              disabled={!normalizedCode || loading}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white text-black px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Ativando..." : "Ativar tela"}
            </button>
            {errorMessage && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-sm text-red-200">
                <AlertCircle className="h-4 w-4" />
                {errorMessage}
              </p>
            )}
          </div>
          <div className="rounded-xl border border-white/15 bg-black/40 p-3">
            <p className="mb-2 text-center text-xs uppercase tracking-wider text-white/60">
              QR opcional
            </p>
            <img
              src={qrUrl}
              alt="QR code de pareamento"
              className="h-[180px] w-[180px] rounded-md bg-white p-2"
            />
            <p className="mt-2 text-center text-[11px] text-white/60">
              <QrCode className="mr-1 inline h-3.5 w-3.5" />
              Use no app admin para preencher o código.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

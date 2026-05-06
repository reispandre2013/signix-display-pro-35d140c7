import { createFileRoute } from "@tanstack/react-router";
import { Download, Smartphone, Tv } from "lucide-react";

// URL pública do APK. Substitua pela URL final hospedada (ex.: storage Supabase, GitHub Releases, etc.).
const APK_URL = "https://signix-display-pro.lovable.app/downloads/signix-player-tv.apk";
const APK_VERSION = "1.0.19";
const APK_SIZE = "~12 MB";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Baixar Signix Player TV — APK Android" },
      {
        name: "description",
        content:
          "Faça o download do APK do Signix Player TV diretamente na sua Smart TV ou Android TV.",
      },
      { property: "og:title", content: "Baixar Signix Player TV" },
      {
        property: "og:description",
        content: "Instale o Signix Player TV diretamente no seu dispositivo.",
      },
    ],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 ring-1 ring-primary/20 mb-6">
            <Tv className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Signix Player TV
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Baixe e instale o aplicativo direto na sua TV
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-elegant">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Versão</p>
              <p className="text-xl font-semibold">{APK_VERSION}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Tamanho</p>
              <p className="text-xl font-semibold">{APK_SIZE}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Plataforma</p>
              <p className="text-xl font-semibold">Android TV</p>
            </div>
          </div>

          <a
            href={APK_URL}
            download
            className="flex items-center justify-center gap-3 w-full rounded-xl bg-primary text-primary-foreground py-5 text-lg font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-4 focus:ring-primary/30"
            autoFocus
          >
            <Download className="w-6 h-6" />
            Baixar APK agora
          </a>

          <p className="mt-4 text-center text-xs text-muted-foreground break-all">{APK_URL}</p>
        </div>

        <div className="mt-8 rounded-2xl border bg-card/50 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Smartphone className="w-5 h-5 text-primary" />
            Como instalar na TV
          </h2>
          <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
            <li>
              Abra o navegador da sua TV e acesse{" "}
              <span className="font-mono text-foreground">sigplayer.com.br/download</span>.
            </li>
            <li>Toque em "Baixar APK agora" e aguarde o download terminar.</li>
            <li>
              Em <strong className="text-foreground">Configurações → Segurança</strong>, ative
              "Fontes desconhecidas" para o navegador / gerenciador de arquivos.
            </li>
            <li>Abra o arquivo baixado e confirme a instalação.</li>
            <li>Após instalar, abra o app e siga o pareamento exibido na tela.</li>
          </ol>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Problemas para instalar? Contate o suporte da sua organização.
        </p>
      </div>
    </div>
  );
}

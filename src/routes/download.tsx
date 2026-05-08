import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Download, Tv, Shield, Zap } from "lucide-react";

export const Route = createFileRoute("/download")({
  component: DownloadPage,
  head: () => ({
    meta: [
      { title: "Download Signix TV Player APK | SigPlayer" },
      {
        name: "description",
        content:
          "Baixe o APK oficial do Signix TV Player para Android TV. Pareamento permanente, modo kiosk e reprodução 24/7.",
      },
    ],
  }),
});

const APK_URL = "/downloads/signix-tv-player.apk";
const APK_NAME = "signix-tv-player.apk";

function DownloadPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Tv className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Signix TV Player para Android TV
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            APK oficial do player nativo. Pareamento permanente, modo kiosk e
            reprodução contínua das playlists do seu painel SigPlayer.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Button asChild size="lg" className="h-14 px-8 text-base">
              <a href={APK_URL} download={APK_NAME}>
                <Download className="mr-2 h-5 w-5" />
                Baixar APK (14 MB)
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              Versão atual • Compatível com Android TV 5.0+ (API 21)
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <Feature
            icon={<Shield className="h-5 w-5" />}
            title="Pareamento permanente"
            text="O dispositivo é pareado uma única vez e nunca pede código novamente."
          />
          <Feature
            icon={<Zap className="h-5 w-5" />}
            title="Auto-start no boot"
            text="Reabre automaticamente após reinício da TV, em tela cheia."
          />
          <Feature
            icon={<Tv className="h-5 w-5" />}
            title="Modo kiosk"
            text="Lock Task ativo: bloqueia saída do app e mantém a reprodução 24/7."
          />
        </div>

        <div className="mt-16 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Como instalar</h2>
          <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>1. Baixe o arquivo .apk no botão acima.</li>
            <li>
              2. Transfira para a TV via pendrive USB ou use o app{" "}
              <span className="font-medium text-foreground">Send Files to TV</span>.
            </li>
            <li>
              3. Habilite <span className="font-medium text-foreground">Fontes desconhecidas</span>{" "}
              em Configurações → Segurança.
            </li>
            <li>4. Abra o APK pelo gerenciador de arquivos e instale.</li>
            <li>
              5. Ao iniciar, anote o código de 6 dígitos exibido e vincule no painel em{" "}
              <span className="font-medium text-foreground">Telas → Vincular Android TV</span>.
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

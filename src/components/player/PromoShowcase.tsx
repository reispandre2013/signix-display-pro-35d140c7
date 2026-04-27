import { useEffect, useState } from "react";
import {
  Tv,
  Wifi,
  Layers,
  CalendarClock,
  MonitorPlay,
  Activity,
  Store,
  UtensilsCrossed,
  Building2,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe2,
} from "lucide-react";

type Slide = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  bullets: { icon: React.ComponentType<{ className?: string }>; label: string; desc: string }[];
  accent: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Digital Signage Cloud",
    accent: "from-primary/40 via-primary/10 to-transparent",
    title: (
      <>
        Controle <span className="text-gradient">cada tela</span>
        <br />
        do seu negócio em tempo real
      </>
    ),
    subtitle:
      "Plataforma completa para gerenciar playlists, campanhas e dispositivos em todas as unidades a partir de um único painel.",
    bullets: [
      { icon: Sparkles, label: "Multi-telas", desc: "Gestão centralizada ilimitada" },
      { icon: ShieldCheck, label: "Seguro", desc: "Enterprise-grade + RLS" },
      { icon: Zap, label: "Rápido", desc: "Sincronização em <2s" },
    ],
  },
  {
    eyebrow: "Recursos principais",
    accent: "from-emerald-500/30 via-primary/10 to-transparent",
    title: (
      <>
        Tudo que você precisa para <span className="text-gradient">comunicar</span>
      </>
    ),
    subtitle:
      "Do upload da mídia à exibição na tela: playlists, campanhas segmentadas, agendamento e monitoramento em tempo real.",
    bullets: [
      { icon: Layers, label: "Playlists & Campanhas", desc: "Por prioridade, período e alvo" },
      { icon: CalendarClock, label: "Agendamento inteligente", desc: "Dia, hora e público certo" },
      { icon: MonitorPlay, label: "Multi-player", desc: "Web, Android TV e Tizen" },
      { icon: Activity, label: "Monitoramento", desc: "Heartbeat e proof-of-play" },
    ],
  },
  {
    eyebrow: "Para o seu segmento",
    accent: "from-amber-500/30 via-primary/10 to-transparent",
    title: (
      <>
        Feito para quem <span className="text-gradient">vive de atenção</span>
      </>
    ),
    subtitle:
      "Varejo, food service e corporativo usam o Signix para transformar telas em canais de comunicação e venda.",
    bullets: [
      { icon: Store, label: "Varejo", desc: "Promoções e vitrines dinâmicas" },
      {
        icon: UtensilsCrossed,
        label: "Restaurantes",
        desc: "Cardápios digitais e combos em tempo real",
      },
      { icon: Building2, label: "Corporativo", desc: "Comunicação interna e KPIs ao vivo" },
    ],
  },
  {
    eyebrow: "Resultados comprovados",
    accent: "from-fuchsia-500/30 via-primary/10 to-transparent",
    title: (
      <>
        Escala enterprise, <span className="text-gradient">simples de usar</span>
      </>
    ),
    subtitle:
      "Infraestrutura cloud nativa, com alta disponibilidade e operação 24/7 em milhares de pontos.",
    bullets: [
      { icon: MonitorPlay, label: "12k+", desc: "Telas ativas" },
      { icon: ShieldCheck, label: "99.9%", desc: "Uptime SLA" },
      { icon: Zap, label: "<2s", desc: "Sincronização" },
    ],
  },
  {
    eyebrow: "Comece agora",
    accent: "from-primary/50 via-primary/20 to-transparent",
    title: (
      <>
        Sua próxima tela <span className="text-gradient">começa aqui</span>
      </>
    ),
    subtitle:
      "Conheça o Signix e descubra como transformar cada display em um canal de comunicação inteligente.",
    bullets: [
      { icon: Globe2, label: "signix-display-pro.lovable.app", desc: "Acesse e saiba mais" },
    ],
  },
];

const SLIDE_DURATION_MS = 8000;

export function PromoShowcase() {
  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setTimeout(() => setIdx((i) => (i + 1) % SLIDES.length), SLIDE_DURATION_MS);
    return () => clearTimeout(t);
  }, [idx]);

  useEffect(() => {
    const c = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(c);
  }, []);

  const slide = SLIDES[idx];

  return (
    <div className="min-h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden relative bg-mesh">
      {/* Animated gradient backdrop */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slide.accent} transition-all duration-1000`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      {/* Top bar */}
      <div className="relative flex items-center justify-between p-6">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Tv className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-none">Signix</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
              Digital Signage Cloud
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card/60 backdrop-blur-md px-3 py-1.5 ring-1 ring-border">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" /> DEMO
          </span>
          <span className="inline-flex items-center gap-1">
            <Wifi className="h-3.5 w-3.5" /> Online
          </span>
          <span className="font-mono">{now.toLocaleTimeString("pt-BR")}</span>
        </div>
      </div>

      {/* Slide content */}
      <div className="relative flex-1 flex items-center justify-center px-6 lg:px-16">
        <div
          key={idx}
          className="max-w-5xl w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-primary/80 font-semibold">
            {slide.eyebrow}
          </p>
          <h1 className="mt-6 font-display text-5xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight">
            {slide.title}
          </h1>
          <p className="mt-8 text-lg lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {slide.subtitle}
          </p>

          <div
            className={`mt-12 grid gap-4 max-w-4xl mx-auto ${
              slide.bullets.length === 1
                ? "grid-cols-1"
                : slide.bullets.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : slide.bullets.length === 3
                    ? "grid-cols-1 sm:grid-cols-3"
                    : "grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {slide.bullets.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.label}
                  className="rounded-2xl border border-border bg-card/60 backdrop-blur-md px-5 py-5 text-left"
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-primary grid place-items-center shadow-glow mb-3">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="font-display text-xl font-bold">{b.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{b.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="relative px-6 pb-6">
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden bg-border">
              <div
                className="h-full bg-gradient-primary transition-[width] ease-linear"
                style={{
                  width: i < idx ? "100%" : i === idx ? "100%" : "0%",
                  transitionDuration: i === idx ? `${SLIDE_DURATION_MS}ms` : "0ms",
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Apresentação institucional · {idx + 1} / {SLIDES.length}
          </span>
          <span>signix-display-pro.lovable.app</span>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import {
  Tv,
  ArrowRight,
  Zap,
  AlertTriangle,
  Eye,
  Megaphone,
  ShoppingBag,
  TrendingDown,
  MonitorPlay,
  CalendarClock,
  CloudUpload,
  Globe2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Flame,
  Star,
  Quote,
  ChevronDown,
  Layers,
  PlayCircle,
} from "lucide-react";
import { useState } from "react";

const BUY_URL = "https://sigplayer.com.br/";

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [
      { title: "SigPlayer — Transforme sua TV em uma máquina de vendas" },
      {
        name: "description",
        content:
          "SigPlayer é o sistema de Digital Signage que transforma qualquer TV em um vendedor silencioso. Controle suas telas, programe conteúdos e venda mais — automaticamente.",
      },
      { property: "og:title", content: "SigPlayer — Sua TV vendendo no automático" },
      {
        property: "og:description",
        content:
          "Pare de perder vendas com TVs paradas. Com o SigPlayer, cada tela vira um canal de propaganda inteligente.",
      },
    ],
  }),
  component: SalesPage,
});

function CTAButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
    xl: "px-9 py-5 text-lg",
  };
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-tight transition-smooth hover:scale-[1.02] active:scale-[0.98]";
  const variants = {
    primary:
      "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-[0_0_40px_-5px_oklch(0.78_0.18_245/60%)]",
    outline:
      "border border-primary/40 bg-card/50 backdrop-blur text-foreground hover:bg-primary/10 hover:border-primary",
  };
  return (
    <a
      href={BUY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </a>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-[0.4em] text-primary/80 font-bold mb-4">{children}</p>
  );
}

function SalesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
              <Tv className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <span className="font-display text-lg font-bold block">SigPlayer</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Digital Signage
              </span>
            </div>
          </a>
          <CTAButton size="md">
            COMEÇAR AGORA <ArrowRight className="h-4 w-4" />
          </CTAButton>
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-mesh overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.68_0.19_252/25%)_0%,_transparent_60%)]" />
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[oklch(0.7_0.18_305/25%)] blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur px-4 py-1.5 text-xs font-semibold text-primary">
              <Flame className="h-3.5 w-3.5" /> SISTEMA #1 DE TV PARA NEGÓCIOS
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Sua TV não vende?
              <br />
              <span className="text-gradient">Você está perdendo dinheiro</span>
              <br />
              todos os dias.
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Transforme qualquer tela em uma{" "}
              <span className="text-foreground font-semibold">
                máquina de vendas automática
              </span>{" "}
              com o SigPlayer. Programe, exiba e venda — sem esforço.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <CTAButton size="lg">
                COMEÇAR AGORA <ArrowRight className="h-5 w-5" />
              </CTAButton>
              <CTAButton size="lg" variant="outline">
                <PlayCircle className="h-5 w-5" /> QUERO MINHA TV VENDENDO
              </CTAButton>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> 7 dias de garantia
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> Sem instalação
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> Funciona em qualquer TV
              </div>
            </div>
          </div>

          {/* Mockup TV + Painel */}
          <div className="relative">
            <div className="relative aspect-video rounded-2xl border-[6px] border-card shadow-[0_30px_80px_-20px_oklch(0.68_0.19_252/40%)] bg-gradient-to-br from-primary/30 via-[oklch(0.7_0.18_305/30%)] to-[oklch(0.78_0.18_230/30%)] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(1_0_0/10%)_0%,_transparent_70%)]" />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-card/80 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" /> AO VIVO
              </div>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center px-8">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70 font-bold">
                    Promoção da semana
                  </p>
                  <p className="mt-2 font-display text-3xl lg:text-5xl font-bold text-white drop-shadow-2xl">
                    -40% OFF
                  </p>
                  <p className="mt-2 text-white/90 text-sm lg:text-base">em todos os combos</p>
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-1 bg-card/30">
                <div
                  className="h-full bg-white"
                  style={{ animation: "playerProgress 6s linear infinite" }}
                />
              </div>
            </div>
            <div className="mx-auto w-1/3 h-3 bg-card rounded-b-2xl" />

            {/* Painel flutuante */}
            <div className="absolute -bottom-8 -right-4 lg:-right-8 w-64 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-elegant p-4 hidden sm:block">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-primary grid place-items-center">
                    <MonitorPlay className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-bold">Painel SigPlayer</span>
                </div>
                <span className="text-[10px] text-success">● Online</span>
              </div>
              <div className="space-y-2">
                {["Loja Centro", "Filial Shopping", "Drive Thru"].map((s, i) => (
                  <div
                    key={s}
                    className="flex items-center justify-between text-[11px] rounded-lg bg-surface px-2.5 py-1.5"
                  >
                    <span>{s}</span>
                    <span className="text-success">{i === 1 ? "●" : "●"} ativa</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionEyebrow>O problema invisível</SectionEyebrow>
            <h2 className="font-display text-3xl lg:text-5xl font-bold leading-tight">
              Toda loja tem TV…
              <br />
              <span className="text-gradient">mas quase nenhuma usa do jeito certo.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Você liga a TV, deixa passar canal aberto ou um vídeo aleatório no YouTube — e
              acha que está "comunicando". Não está. Você está perdendo vendas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { i: AlertTriangle, t: "TV ligada sem estratégia", d: "Conteúdo aleatório, zero conversão." },
              { i: Eye, t: "Cliente não vê promoções", d: "Sua melhor oferta passa despercebida." },
              { i: ShoppingBag, t: "Produtos não chamam atenção", d: "Sem destaque, sem desejo de compra." },
              { i: Layers, t: "Falta de padronização", d: "Cada unidade exibindo coisa diferente." },
              { i: TrendingDown, t: "Perda de vendas invisível", d: "Você nem percebe o quanto deixa na mesa." },
              { i: Clock, t: "Tempo desperdiçado", d: "Trocar pendrive em cada loja? Inviável." },
            ].map((p) => (
              <div
                key={p.t}
                className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 hover:border-destructive/40 transition-smooth"
              >
                <div className="h-10 w-10 rounded-xl bg-destructive/15 grid place-items-center mb-3">
                  <p.i className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="font-display font-bold text-base">{p.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="py-24 px-6 bg-mesh relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.68_0.19_252/15%)_0%,_transparent_70%)]" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionEyebrow>A solução</SectionEyebrow>
            <h2 className="font-display text-3xl lg:text-5xl font-bold leading-tight">
              Com o SigPlayer, sua TV deixa de ser decoração
              <br />
              <span className="text-gradient">e passa a vender por você.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {[
              { i: MonitorPlay, t: "Controle total das telas", d: "Veja o que está rodando em cada display, em tempo real." },
              { i: CalendarClock, t: "Conteúdo programado", d: "Agende campanhas por dia, hora e segmento." },
              { i: CloudUpload, t: "Atualização instantânea", d: "Trocou a oferta? Em 2 segundos está no ar." },
              { i: Sparkles, t: "Fácil de usar", d: "Sem técnico. Sem complicação. Você no controle." },
              { i: Tv, t: "Funciona em qualquer TV", d: "Smart TV, Android, Tizen, web — tudo conectado." },
            ].map((s) => (
              <div
                key={s.t}
                className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 text-center hover:border-primary/50 hover:shadow-glow transition-smooth"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-primary grid place-items-center mx-auto mb-4 shadow-glow">
                  <s.i className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-base">{s.t}</h3>
                <p className="text-xs text-muted-foreground mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionEyebrow>Benefícios</SectionEyebrow>
            <h2 className="font-display text-3xl lg:text-5xl font-bold">
              Tudo que você precisa para <span className="text-gradient">vender mais</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { i: MonitorPlay, t: "Gerencie suas telas", d: "Painel único para todas as unidades. Visão total da operação." },
              { i: CalendarClock, t: "Programe conteúdos", d: "Playlists, campanhas e agendamento inteligente." },
              { i: Eye, t: "Monitore em tempo real", d: "Saiba o que cada tela está exibindo agora mesmo." },
              { i: Globe2, t: "Controle de qualquer lugar", d: "Cloud nativo. Acesse pelo navegador, do celular ou do PC." },
              { i: TrendingDown, t: "Aumente suas vendas", d: "Comunicação visual estratégica gera mais conversão." },
              { i: ShieldCheck, t: "Profissionalize sua loja", d: "Sua marca consistente, moderna e em movimento." },
            ].map((b) => (
              <div
                key={b.t}
                className="group rounded-2xl border border-border bg-gradient-surface p-6 hover:border-primary/50 transition-smooth"
              >
                <div className="h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-5 group-hover:scale-110 transition-transform">
                  <b.i className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-lg">{b.t}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-24 px-6 bg-surface/50 border-y border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionEyebrow>Em 4 passos simples</SectionEyebrow>
            <h2 className="font-display text-3xl lg:text-5xl font-bold">
              Sua TV vendendo em <span className="text-gradient">poucos minutos</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              { n: "01", t: "Crie sua conta", d: "Cadastro rápido. Sem complicação." },
              { n: "02", t: "Cadastre suas telas", d: "Pareie cada TV em segundos." },
              { n: "03", t: "Envie seus conteúdos", d: "Imagens, vídeos, promoções, cardápios." },
              { n: "04", t: "Pronto, sua TV vende", d: "Conteúdo no ar, automaticamente." },
            ].map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-border bg-card/60 backdrop-blur p-6"
              >
                <div className="font-display text-5xl font-bold text-gradient leading-none mb-4">
                  {s.n}
                </div>
                <h3 className="font-display font-bold text-lg">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <CTAButton size="lg">
              QUERO COMEÇAR AGORA <ArrowRight className="h-5 w-5" />
            </CTAButton>
          </div>
        </div>
      </section>

      {/* PROVA */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionEyebrow>Resultados reais</SectionEyebrow>
            <h2 className="font-display text-3xl lg:text-5xl font-bold leading-tight">
              Empresas estão transformando suas TVs em
              <br />
              <span className="text-gradient">vendedores silenciosos</span>
            </h2>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              { v: "+38%", l: "Aumento médio em conversão" },
              { v: "12k+", l: "Telas ativas no Brasil" },
              { v: "99.9%", l: "Uptime de operação" },
              { v: "<2s", l: "Sincronização de conteúdo" },
            ].map((m) => (
              <div
                key={m.l}
                className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6 text-center"
              >
                <div className="font-display text-3xl lg:text-4xl font-bold text-gradient">
                  {m.v}
                </div>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
                  {m.l}
                </p>
              </div>
            ))}
          </div>

          {/* Depoimentos */}
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                n: "Carlos M.",
                r: "Dono de Restaurante",
                t: "Coloquei o SigPlayer nas TVs do salão e vi os combos saindo muito mais. Os clientes pedem o que aparece na tela.",
              },
              {
                n: "Ana P.",
                r: "Gerente de Rede de Lojas",
                t: "Antes era pendrive em cada loja. Hoje atualizo tudo do meu computador. Ganhei dias de trabalho por mês.",
              },
              {
                n: "Rafael T.",
                r: "Franqueado",
                t: "A padronização visual mudou totalmente a percepção da marca nas unidades. Parece outra empresa.",
              },
            ].map((d) => (
              <div
                key={d.n}
                className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 hover:border-primary/40 transition-smooth"
              >
                <Quote className="h-7 w-7 text-primary/60 mb-3" />
                <p className="text-sm leading-relaxed text-foreground/90">"{d.t}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary grid place-items-center font-bold text-primary-foreground">
                    {d.n[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{d.n}</p>
                    <p className="text-xs text-muted-foreground">{d.r}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section className="py-24 px-6 bg-mesh border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionEyebrow>Escolha seu plano</SectionEyebrow>
            <h2 className="font-display text-3xl lg:text-5xl font-bold">
              Comece pequeno. <span className="text-gradient">Cresça sem limites.</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Todos os planos incluem 7 dias de garantia. Se não for pra você, devolvemos seu
              dinheiro.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: "Starter",
                d: "Para quem está começando a profissionalizar a comunicação visual.",
                f: ["Até 2 telas", "Playlists ilimitadas", "Painel cloud", "Suporte por e-mail"],
                pop: false,
              },
              {
                n: "Pro",
                d: "Para negócios em crescimento que precisam de mais flexibilidade.",
                f: [
                  "Até 10 telas",
                  "Campanhas e agendamento",
                  "Multi-usuários",
                  "Suporte prioritário",
                  "Relatórios de exibição",
                ],
                pop: true,
              },
              {
                n: "Business",
                d: "Para redes e franquias que querem operação enterprise.",
                f: [
                  "Telas ilimitadas",
                  "Multi-unidades",
                  "Permissões avançadas",
                  "Setup assistido",
                  "Suporte dedicado",
                ],
                pop: false,
              },
            ].map((p) => (
              <div
                key={p.n}
                className={`relative rounded-3xl border p-8 transition-smooth flex flex-col ${
                  p.pop
                    ? "border-primary bg-card shadow-glow scale-[1.02]"
                    : "border-border bg-card/60 backdrop-blur hover:border-primary/40"
                }`}
              >
                {p.pop && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-glow">
                    <Flame className="h-3 w-3" /> MAIS ESCOLHIDO
                  </div>
                )}
                <h3 className="font-display text-2xl font-bold">{p.n}</h3>
                <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">{p.d}</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {p.f.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <CTAButton
                    size="lg"
                    variant={p.pop ? "primary" : "outline"}
                    className="w-full"
                  >
                    QUERO ESSE PLANO <ArrowRight className="h-4 w-4" />
                  </CTAButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* URGÊNCIA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-4 py-1.5 text-xs font-bold text-warning mb-6">
            <Flame className="h-3.5 w-3.5" /> ATENÇÃO
          </div>
          <h2 className="font-display text-3xl lg:text-5xl font-bold leading-tight">
            Enquanto você pensa,
            <br />
            <span className="text-gradient">seu concorrente já pode estar usando isso.</span>
          </h2>

          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card/60 p-6 text-left">
              <Megaphone className="h-6 w-6 text-primary mb-3" />
              <p className="font-display font-bold text-lg">Quem chama atenção, vende mais.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Conteúdo dinâmico prende o olhar e gera desejo de compra.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/60 p-6 text-left">
              <Tv className="h-6 w-6 text-destructive mb-3" />
              <p className="font-display font-bold text-lg">TV parada não gera resultado.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Cada minuto de tela mal aproveitada é dinheiro deixado na mesa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-[oklch(0.7_0.18_305/20%)] to-[oklch(0.78_0.18_230/30%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.68_0.19_252/30%)_0%,_transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Zap className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="font-display text-4xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
            Sua TV pode continuar sendo ignorada…
            <br />
            <span className="text-gradient">ou começar a vender hoje.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            A escolha é sua. Mas lembre-se: cada dia sem o SigPlayer é um dia de vendas perdidas.
          </p>
          <div className="mt-10">
            <CTAButton size="xl">
              COMEÇAR AGORA COM O SIGPLAYER <ArrowRight className="h-6 w-6" />
            </CTAButton>
            <p className="mt-4 text-xs text-muted-foreground">
              7 dias de garantia · Sem fidelidade · Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* FOOTER */}
      <footer className="border-t border-border/50 bg-surface/50 px-6 py-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
                <Tv className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">SigPlayer</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              A plataforma de Digital Signage que transforma cada tela do seu negócio em um canal
              de vendas inteligente.
            </p>
          </div>
          <div>
            <p className="font-bold text-sm mb-3">Produto</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href={BUY_URL} className="hover:text-foreground">
                  Planos
                </a>
              </li>
              <li>
                <a href="/player" className="hover:text-foreground">
                  Demo do player
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-foreground">
                  Entrar
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-sm mb-3">Legal</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">
                  Termos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Suporte
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 SigPlayer · Digital Signage Cloud</p>
          <p>Feito para quem quer vender mais.</p>
        </div>
      </footer>
    </div>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Preciso instalar algo?",
      a: "Não. O SigPlayer é 100% cloud. Você acessa pelo navegador e a TV roda o player web ou aplicativo Android/Tizen — sem servidor, sem instalação complicada.",
    },
    {
      q: "Funciona em qualquer TV?",
      a: "Sim. Funciona em Smart TVs (Android TV, Tizen, WebOS), TVs comuns com um TV Box, computadores e até navegadores. Se tem tela e internet, o SigPlayer roda.",
    },
    {
      q: "É difícil de usar?",
      a: "Não. O painel foi feito pra ser usado por qualquer pessoa, sem conhecimento técnico. Em poucos cliques você sobe um vídeo e ele aparece na sua TV.",
    },
    {
      q: "Preciso de conhecimento técnico?",
      a: "Nenhum. E se quiser, oferecemos um setup profissional opcional onde configuramos tudo pra você — playlists, telas, treinamento da equipe.",
    },
    {
      q: "Posso testar antes?",
      a: "Sim. Todos os planos têm 7 dias de garantia. Se não for o que você esperava, devolvemos 100% do seu dinheiro.",
    },
    {
      q: "Funciona para qualquer tipo de negócio?",
      a: "Sim. Restaurantes, lojas, academias, clínicas, franquias, postos, hotéis, escritórios, eventos. Onde tem tela, tem oportunidade de vender mais.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24 px-6 border-t border-border/50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <SectionEyebrow>Perguntas frequentes</SectionEyebrow>
          <h2 className="font-display text-3xl lg:text-5xl font-bold">
            Ainda tem <span className="text-gradient">dúvidas?</span>
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={f.q}
              className="rounded-2xl border border-border bg-card/60 backdrop-blur overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-accent/30 transition-smooth"
              >
                <span className="font-display font-bold text-base lg:text-lg">{f.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-primary transition-transform ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <CTAButton size="lg">
            COMEÇAR AGORA <ArrowRight className="h-5 w-5" />
          </CTAButton>
        </div>
      </div>
    </section>
  );
}

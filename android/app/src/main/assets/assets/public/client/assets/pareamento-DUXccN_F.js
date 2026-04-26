import { r as a, j as e, L as b } from "./index-DUcMANMA.js";
import { C as j, c as v, a as w } from "./screens.functions-DEfLXJLl.js";
import { T as N } from "./tv-qkDTjJdC.js";
import { A as y } from "./arrow-left-CluiURL3.js";
import { L as S } from "./loader-circle-BffduC8P.js";
import { M as E } from "./monitor-Ck3Yxne9.js";
import { W as I } from "./wifi-DZkc2jYa.js";
import { R as C } from "./refresh-cw-BxkW6C-k.js";
import "./createLucideIcon-BDYLgomD.js";
import "./createServerFn-CVG1bUiD.js";
const n = "signix_pairing_code",
  i = "signix_pairing_code_exp";
function V() {
  const [r, o] = a.useState(null),
    [l, c] = a.useState(!0),
    [d, u] = a.useState(!1),
    [x, g] = a.useState(null),
    p = async () => {
      (c(!0), g(null));
      try {
        const t = await v();
        if (t?.code)
          (localStorage.setItem(n, t.code),
            t.expires_at && localStorage.setItem(i, t.expires_at),
            o(t.code));
        else throw new Error("Resposta inválida do servidor.");
      } catch (t) {
        (console.error("[pareamento] generateCode failed:", t),
          localStorage.removeItem(n),
          localStorage.removeItem(i),
          o(null));
        const s = t instanceof Error ? t.message : String(t);
        g(
          s && s !== "HTTPError"
            ? s
            : "Não foi possível registrar o código de pareamento. Verifique a conexão e tente novamente.",
        );
      } finally {
        c(!1);
      }
    };
  return (
    a.useEffect(() => {
      const t = localStorage.getItem(n),
        s = localStorage.getItem(i);
      t && s && new Date(s).getTime() > Date.now() + 3e4
        ? (o(t), c(!1))
        : (localStorage.removeItem(n), localStorage.removeItem(i), p());
    }, []),
    a.useEffect(() => {
      if (!r || d) return;
      let t = !1;
      const s = async () => {
        try {
          const h = await w({ data: { code: r } });
          !t && h?.paired && u(!0);
        } catch {}
      };
      s();
      const f = setInterval(s, 4e3);
      return () => {
        ((t = !0), clearInterval(f));
      };
    }, [r, d]),
    e.jsxs("div", {
      className: "min-h-screen flex flex-col bg-background bg-mesh",
      children: [
        e.jsxs("div", {
          className: "flex items-center justify-between px-6 py-4 border-b border-border",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-2.5",
              children: [
                e.jsx("div", {
                  className:
                    "h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow",
                  children: e.jsx(N, { className: "h-5 w-5 text-primary-foreground" }),
                }),
                e.jsx("span", {
                  className: "font-display text-lg font-bold",
                  children: "Signix Player",
                }),
              ],
            }),
            e.jsxs(b, {
              to: "/login",
              className:
                "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground",
              children: [e.jsx(y, { className: "h-3.5 w-3.5" }), " Painel administrativo"],
            }),
          ],
        }),
        e.jsx("div", {
          className: "flex-1 grid place-items-center p-6",
          children: e.jsx("div", {
            className: "w-full max-w-xl text-center",
            children: d
              ? e.jsxs(e.Fragment, {
                  children: [
                    e.jsx("div", {
                      className:
                        "inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 text-success px-3 py-1 text-xs",
                      children: "✓ Dispositivo pareado com sucesso",
                    }),
                    e.jsxs("h1", {
                      className: "mt-6 font-display text-3xl lg:text-4xl font-bold leading-tight",
                      children: ["Tudo pronto!", e.jsx("br", {}), "Aguardando primeira campanha…"],
                    }),
                  ],
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsxs("div", {
                      className:
                        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs",
                      children: [
                        e.jsx("span", {
                          className: "h-1.5 w-1.5 rounded-full bg-success pulse-dot",
                        }),
                        " Aguardando confirmação no painel",
                      ],
                    }),
                    e.jsxs("h1", {
                      className: "mt-6 font-display text-3xl lg:text-4xl font-bold leading-tight",
                      children: [
                        "Use o código abaixo para parear",
                        e.jsx("br", {}),
                        "este dispositivo à sua conta",
                      ],
                    }),
                    e.jsxs("p", {
                      className: "mt-3 text-muted-foreground max-w-md mx-auto text-sm",
                      children: [
                        "Acesse ",
                        e.jsx("span", {
                          className: "text-foreground font-medium",
                          children: "Telas › Adicionar tela",
                        }),
                        " no painel Signix e informe o código exibido.",
                      ],
                    }),
                    e.jsx("div", {
                      className:
                        "mt-10 inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-8 py-6 shadow-glow min-h-[120px]",
                      children: l
                        ? e.jsx(S, { className: "h-10 w-10 animate-spin text-primary" })
                        : x
                          ? e.jsx("p", {
                              className: "max-w-sm text-sm text-destructive",
                              children: x,
                            })
                          : r
                            ? r
                                .split("")
                                .map((t, s) =>
                                  t === "-"
                                    ? e.jsx(
                                        "span",
                                        {
                                          className: "font-display text-4xl text-muted-foreground",
                                          children: "·",
                                        },
                                        s,
                                      )
                                    : e.jsx(
                                        "span",
                                        {
                                          className:
                                            "font-mono text-5xl font-bold text-gradient w-10 text-center",
                                          children: t,
                                        },
                                        s,
                                      ),
                                )
                            : null,
                    }),
                    e.jsxs("div", {
                      className: "mt-8 grid sm:grid-cols-3 gap-3 max-w-md mx-auto text-left",
                      children: [
                        e.jsx(m, {
                          icon: E,
                          label: "Resolução",
                          value: `${window.screen.width} × ${window.screen.height}`,
                        }),
                        e.jsx(m, {
                          icon: j,
                          label: "Plataforma",
                          value: navigator.platform || "Web",
                        }),
                        e.jsx(m, {
                          icon: I,
                          label: "Conexão",
                          value: navigator.onLine ? "Online" : "Offline",
                        }),
                      ],
                    }),
                    e.jsxs("button", {
                      onClick: () => {
                        (localStorage.removeItem(n), localStorage.removeItem(i), p());
                      },
                      disabled: l,
                      className:
                        "mt-8 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-accent transition-smooth disabled:opacity-60",
                      children: [e.jsx(C, { className: "h-3.5 w-3.5" }), " Gerar novo código"],
                    }),
                  ],
                }),
          }),
        }),
      ],
    })
  );
}
function m({ icon: r, label: o, value: l }) {
  return e.jsxs("div", {
    className: "rounded-lg border border-border bg-card/60 p-3",
    children: [
      e.jsxs("div", {
        className:
          "flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground",
        children: [e.jsx(r, { className: "h-3.5 w-3.5" }), " ", o],
      }),
      e.jsx("div", { className: "mt-1 text-sm font-medium truncate", children: l }),
    ],
  });
}
export { V as component };

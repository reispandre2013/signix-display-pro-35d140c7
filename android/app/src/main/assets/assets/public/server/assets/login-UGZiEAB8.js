import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { u as useNavigate, a as useAuth, L as Link, t as toast } from "./router-BfC5KUx0.js";
import { T as Tv } from "./tv-BGJcO9c3.js";
import { M as Mail } from "./mail-C3nK1-bX.js";
import { L as Lock } from "./lock-Dtnrjfkd.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import { E as Eye } from "./eye-B03_hUEz.js";
import { L as LoaderCircle } from "./loader-circle-DWZmQ-AH.js";
import { A as ArrowRight } from "./arrow-right-pyLYeR4E.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.js";
const __iconNode = [
  [
    "path",
    {
      d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      key: "ct8e1f",
    },
  ],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
  [
    "path",
    {
      d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      key: "13bj9a",
    },
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }],
];
const EyeOff = createLucideIcon("eye-off", __iconNode);
function LoginPage() {
  const [show, setShow] = reactExports.useState(false);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const navigate = useNavigate();
  const { signIn, session, loading } = useAuth();
  reactExports.useEffect(() => {
    if (!loading && session)
      navigate({
        to: "/app",
        replace: true,
      });
  }, [loading, session, navigate]);
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message ?? "Não foi possível entrar.");
      return;
    }
    toast.success("Bem-vindo!");
    navigate({
      to: "/app",
      replace: true,
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "min-h-screen grid lg:grid-cols-2 bg-background bg-mesh",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className:
          "hidden lg:flex relative flex-col justify-between p-12 border-r border-border overflow-hidden",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className:
              "absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent",
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "relative flex items-center gap-2.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                className:
                  "h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, {
                  className: "h-5 w-5 text-primary-foreground",
                }),
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                    className: "font-display text-xl font-bold",
                    children: "Signix",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                    className: "text-[11px] uppercase tracking-widest text-muted-foreground",
                    children: "Digital Signage Cloud",
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "relative space-y-6",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", {
                className:
                  "font-display text-4xl xl:text-5xl font-bold leading-[1.05] tracking-tight",
                children: [
                  "Controle ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                    className: "text-gradient",
                    children: "cada tela",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "do seu negócio em",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "tempo real.",
                ],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                className: "text-muted-foreground max-w-md",
                children:
                  "Gerencie playlists, campanhas e dispositivos em todas as unidades a partir de um único painel premium.",
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                className: "grid grid-cols-3 gap-4 max-w-md pt-6",
                children: [
                  {
                    v: "12k+",
                    l: "Telas ativas",
                  },
                  {
                    v: "99.9%",
                    l: "Uptime SLA",
                  },
                  {
                    v: "<2s",
                    l: "Sincronização",
                  },
                ].map((s) =>
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "rounded-lg border border-border bg-card/60 px-3 py-3",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                          className: "font-display text-2xl font-bold text-gradient",
                          children: s.v,
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                          className: "text-[11px] text-muted-foreground mt-0.5",
                          children: s.l,
                        }),
                      ],
                    },
                    s.l,
                  ),
                ),
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "relative text-xs text-muted-foreground",
            children: "© 2025 Signix · SaaS Enterprise",
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "flex items-center justify-center p-6 lg:p-12",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "w-full max-w-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "lg:hidden mb-8 flex items-center gap-2.5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className:
                    "h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, {
                    className: "h-5 w-5 text-primary-foreground",
                  }),
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "font-display text-xl font-bold",
                  children: "Signix",
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
              className: "font-display text-2xl font-bold",
              children: "Bem-vindo de volta",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className: "text-sm text-muted-foreground mt-1",
              children: "Acesse seu painel administrativo.",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
              onSubmit,
              className: "mt-8 space-y-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", {
                      className: "text-xs font-medium text-muted-foreground mb-1.5 block",
                      children: "E-mail",
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      className: "relative",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, {
                          className:
                            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("input", {
                          type: "email",
                          required: true,
                          autoComplete: "email",
                          value: email,
                          onChange: (e) => setEmail(e.target.value),
                          placeholder: "voce@empresa.com",
                          className:
                            "w-full rounded-lg border border-input bg-surface pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth",
                        }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      className: "flex items-center justify-between mb-1.5",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("label", {
                          className: "text-xs font-medium text-muted-foreground",
                          children: "Senha",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
                          to: "/recuperar-senha",
                          className: "text-xs text-primary hover:underline",
                          children: "Esqueci a senha",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      className: "relative",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, {
                          className:
                            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("input", {
                          type: show ? "text" : "password",
                          required: true,
                          autoComplete: "current-password",
                          value: password,
                          onChange: (e) => setPassword(e.target.value),
                          placeholder: "••••••••",
                          className:
                            "w-full rounded-lg border border-input bg-surface pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                          type: "button",
                          onClick: () => setShow(!show),
                          className:
                            "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                          children: show
                            ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, {
                                className: "h-4 w-4",
                              })
                            : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
                        }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                  type: "submit",
                  disabled: submitting,
                  className:
                    "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition-smooth disabled:opacity-60",
                  children: submitting
                    ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, {
                        className: "h-4 w-4 animate-spin",
                      })
                    : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
                        children: [
                          "Entrar no painel ",
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, {
                            className: "h-4 w-4",
                          }),
                        ],
                      }),
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "relative my-6",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                      className: "absolute inset-0 flex items-center",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                        className: "w-full border-t border-border",
                      }),
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                      className: "relative flex justify-center",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                        className:
                          "bg-background px-3 text-[11px] uppercase tracking-widest text-muted-foreground",
                        children: "ou",
                      }),
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
                  to: "/signup",
                  className:
                    "block w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-center text-sm font-medium hover:bg-accent transition-smooth",
                  children: "Criar nova conta",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
                  to: "/pareamento",
                  className:
                    "block w-full text-center text-xs text-muted-foreground hover:text-foreground transition-smooth",
                  children: "Parear um novo player →",
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
export { LoginPage as component };

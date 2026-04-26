import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { L as Link } from "./router-BfC5KUx0.js";
import { P as PageHeader } from "./PageHeader-Dkx9-OAF.js";
import { P as Panel } from "./Panel-iDal3y1F.js";
import { L as LoadingState, a as ErrorState, E as EmptyState } from "./States-BZKT3Fib.js";
import { u as useMedia, a as useCampaigns } from "./use-supabase-data-DWtjSxP7.js";
import { g as getMediaUrlCandidates, a as applyMediaFallback } from "./media-url-DiXiTFtW.js";
import { I as Image } from "./image-BY4KT0BQ.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import { M as Monitor } from "./monitor-4tjVPwPf.js";
import { P as Play } from "./play-Bb_PQeSD.js";
import { V as Volume2 } from "./volume-2-bb8Bln_g.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.js";
import "./utils-Bz4m9VPB.js";
import "./loader-circle-DWZmQ-AH.js";
const __iconNode$4 = [
  ["path", { d: "M8 3H5a2 2 0 0 0-2 2v3", key: "1dcmit" }],
  ["path", { d: "M21 8V5a2 2 0 0 0-2-2h-3", key: "1e4gt3" }],
  ["path", { d: "M3 16v3a2 2 0 0 0 2 2h3", key: "wsl5sc" }],
  ["path", { d: "M16 21h3a2 2 0 0 0 2-2v-3", key: "18trek" }],
];
const Maximize = createLucideIcon("maximize", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z",
      key: "15892j",
    },
  ],
  ["path", { d: "M3 20V4", key: "1ptbpl" }],
];
const SkipBack = createLucideIcon("skip-back", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M21 4v16", key: "7j8fe9" }],
  [
    "path",
    {
      d: "M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z",
      key: "zs4d6",
    },
  ],
];
const SkipForward = createLucideIcon("skip-forward", __iconNode$2);
const __iconNode$1 = [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
];
const Smartphone = createLucideIcon("smartphone", __iconNode$1);
const __iconNode = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
];
const Square = createLucideIcon("square", __iconNode);
function PreviewPage() {
  const { data: media = [], isLoading, error } = useMedia();
  const { data: campaigns = [] } = useCampaigns();
  const items = media.slice(0, 6);
  const [idx, setIdx] = reactExports.useState(0);
  const [orient, setOrient] = reactExports.useState("horizontal");
  const current = items[idx];
  const currentSources = current
    ? getMediaUrlCandidates(current.public_url, current.thumbnail_url)
    : [];
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingState, {});
  if (error) return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error });
  if (items.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "space-y-6",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, {
          title: "Preview de campanhas",
          subtitle: "Visualize antes de publicar.",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, {
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, {
            icon: Image,
            title: "Sem mídias para visualizar",
            description: "Adicione mídias na biblioteca para ver o preview aqui.",
          }),
        }),
      ],
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "space-y-6",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, {
        title: "Preview de campanhas",
        subtitle: "Visualize como a campanha será exibida no player antes de publicar.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, {
          to: "/player",
          className:
            "inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize, { className: "h-3.5 w-3.5" }),
            " Tela cheia",
          ],
        }),
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "lg:col-span-2 space-y-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("button", {
                    onClick: () => setOrient("horizontal"),
                    className: `inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs ${orient === "horizontal" ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "h-3.5 w-3.5" }),
                      " 16:9",
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("button", {
                    onClick: () => setOrient("vertical"),
                    className: `inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs ${orient === "vertical" ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, {
                        className: "h-3.5 w-3.5",
                      }),
                      " 9:16",
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className: `relative mx-auto rounded-2xl border border-border bg-black overflow-hidden shadow-elegant ${orient === "horizontal" ? "aspect-video w-full" : "aspect-[9/16] max-w-sm"}`,
                children: [
                  currentSources.length > 0
                    ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: currentSources[0],
                          "data-sources": JSON.stringify(currentSources),
                          "data-source-index": "0",
                          alt: current.name,
                          className: "w-full h-full object-cover",
                          referrerPolicy: "no-referrer",
                          onError: (e) => applyMediaFallback(e.currentTarget),
                        },
                        `${current.id}-${currentSources[0]}`,
                      )
                    : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                        className: "w-full h-full grid place-items-center text-white/40",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, {
                          className: "h-16 w-16",
                        }),
                      }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                    className: "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    className:
                      "absolute bottom-4 left-4 right-4 flex items-center justify-between text-white",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                            className: "text-xs text-white/60 uppercase tracking-widest",
                            children: "Preview",
                          }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                            className: "font-display text-lg font-bold",
                            children: current.name,
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                        className:
                          "font-mono text-xs bg-black/50 backdrop-blur-md rounded px-2 py-0.5",
                        children: [current.duration_seconds ?? 10, "s"],
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className:
                  "flex items-center justify-center gap-3 rounded-xl border border-border bg-card p-3",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                    onClick: () => setIdx((i) => (i - 1 + items.length) % items.length),
                    className: "h-9 w-9 grid place-items-center rounded-md hover:bg-accent",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipBack, {
                      className: "h-4 w-4",
                    }),
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                    className:
                      "h-11 w-11 grid place-items-center rounded-full bg-gradient-primary shadow-glow",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, {
                      className: "h-5 w-5 text-primary-foreground",
                    }),
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                    onClick: () => setIdx((i) => (i + 1) % items.length),
                    className: "h-9 w-9 grid place-items-center rounded-md hover:bg-accent",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipForward, {
                      className: "h-4 w-4",
                    }),
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                    className: "h-6 w-px bg-border mx-2",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, {
                    className: "h-4 w-4 text-muted-foreground",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", {
                    type: "range",
                    defaultValue: 70,
                    className: "w-32 accent-primary",
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "space-y-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, {
                title: "Itens do preview",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", {
                  className: "space-y-1.5",
                  children: items.map((m, i) =>
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "li",
                      {
                        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", {
                          onClick: () => setIdx(i),
                          className: `w-full flex items-center gap-2.5 rounded-md p-2 text-left transition-smooth ${i === idx ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-surface/60"}`,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                              className: "text-[11px] font-mono text-muted-foreground w-5",
                              children: ["#", i + 1],
                            }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                              className: "h-9 w-14 rounded overflow-hidden bg-muted shrink-0",
                              children:
                                getMediaUrlCandidates(m.thumbnail_url, m.public_url)[0] &&
                                /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                                  src: getMediaUrlCandidates(m.thumbnail_url, m.public_url)[0],
                                  "data-sources": JSON.stringify(
                                    getMediaUrlCandidates(m.thumbnail_url, m.public_url),
                                  ),
                                  "data-source-index": "0",
                                  alt: m.name,
                                  className: "w-full h-full object-cover",
                                  loading: "lazy",
                                  referrerPolicy: "no-referrer",
                                  onError: (e) => applyMediaFallback(e.currentTarget),
                                }),
                            }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                              className: "flex-1 min-w-0",
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                                  className: "text-xs font-medium truncate",
                                  children: m.name,
                                }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                                  className: "text-[10px] text-muted-foreground",
                                  children: [m.duration_seconds ?? 10, "s"],
                                }),
                              ],
                            }),
                            i === idx &&
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Square, {
                                className: "h-3 w-3 text-primary fill-primary",
                              }),
                          ],
                        }),
                      },
                      m.id,
                    ),
                  ),
                }),
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, {
                title: "Detalhes",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", {
                  className: "text-xs space-y-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      className: "flex justify-between",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", {
                          className: "text-muted-foreground",
                          children: "Campanha",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", {
                          children: campaigns[0]?.name ?? "—",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      className: "flex justify-between",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", {
                          className: "text-muted-foreground",
                          children: "Itens",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: items.length }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      className: "flex justify-between",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", {
                          className: "text-muted-foreground",
                          children: "Duração total",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", {
                          children: [
                            items.reduce((s, m) => s + (m.duration_seconds ?? 10), 0),
                            "s",
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { PreviewPage as component };

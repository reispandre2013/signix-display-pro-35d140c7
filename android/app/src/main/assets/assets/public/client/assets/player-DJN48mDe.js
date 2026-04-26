import { r as n, j as e, L as o } from "./index-DUcMANMA.js";
import { u as f, a as u } from "./use-supabase-data-neXhdC03.js";
import { g, a as j } from "./media-url-boppB8Th.js";
import { I as N } from "./image-BlTjWPMR.js";
import { T as v } from "./tv-qkDTjJdC.js";
import { W as w } from "./wifi-DZkc2jYa.js";
import { V as b } from "./volume-2-BdSkCNvX.js";
import { c as y } from "./createLucideIcon-BDYLgomD.js";
const k = [
    ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
    ["path", { d: "m21 3-7 7", key: "1l2asr" }],
    ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
    ["path", { d: "M9 21H3v-6", key: "wtvkvv" }],
  ],
  I = y("maximize-2", k);
function T() {
  const { data: x = [] } = f(),
    { data: m = [] } = u(),
    s = x.filter((t) => t.public_url).slice(0, 6),
    r = m.find((t) => t.status === "active") ?? m[0],
    [l, d] = n.useState(0),
    [p, h] = n.useState(new Date());
  (n.useEffect(() => {
    if (s.length === 0) return;
    const t = setInterval(() => d((i) => (i + 1) % s.length), 5e3);
    return () => clearInterval(t);
  }, [s.length]),
    n.useEffect(() => {
      const t = setInterval(() => h(new Date()), 1e3);
      return () => clearInterval(t);
    }, []));
  const a = s[l],
    c = a ? g(a.public_url, a.thumbnail_url) : [];
  return s.length === 0
    ? e.jsx("div", {
        className: "min-h-screen w-screen bg-black text-white grid place-items-center",
        children: e.jsxs("div", {
          className: "text-center",
          children: [
            e.jsx(N, { className: "h-16 w-16 mx-auto text-white/30" }),
            e.jsx("p", {
              className: "mt-4 text-lg",
              children: "Nenhuma mídia disponível para reprodução",
            }),
            e.jsx(o, {
              to: "/app/midias",
              className: "mt-6 inline-block text-primary hover:underline text-sm",
              children: "Adicionar mídias →",
            }),
          ],
        }),
      })
    : e.jsxs("div", {
        className: "min-h-screen w-screen bg-black text-white flex flex-col overflow-hidden",
        children: [
          e.jsxs("div", {
            className: "absolute inset-0",
            children: [
              e.jsx(
                "img",
                {
                  src: c[0] ?? "",
                  "data-sources": JSON.stringify(c),
                  "data-source-index": "0",
                  alt: a.name,
                  className: "w-full h-full object-cover transition-opacity duration-1000",
                  referrerPolicy: "no-referrer",
                  onError: (t) => j(t.currentTarget),
                },
                `${a.id}-${c[0] ?? "empty"}`,
              ),
              e.jsx("div", {
                className:
                  "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "relative flex items-center justify-between p-6",
            children: [
              e.jsxs("div", {
                className:
                  "flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-3 py-1.5 ring-1 ring-white/10",
                children: [
                  e.jsx(v, { className: "h-4 w-4 text-white/80" }),
                  e.jsx("span", { className: "text-xs font-medium", children: "Signix Player" }),
                  e.jsxs("span", {
                    className: "ml-2 inline-flex items-center gap-1 text-[10px] text-emerald-400",
                    children: [
                      e.jsx("span", {
                        className: "h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot",
                      }),
                      " ONLINE",
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "flex items-center gap-3 text-xs text-white/80",
                children: [
                  e.jsxs("span", {
                    className: "inline-flex items-center gap-1",
                    children: [
                      e.jsx(w, { className: "h-3.5 w-3.5" }),
                      " ",
                      navigator.onLine ? "Online" : "Offline",
                    ],
                  }),
                  e.jsxs("span", {
                    className: "inline-flex items-center gap-1",
                    children: [e.jsx(b, { className: "h-3.5 w-3.5" }), " 60%"],
                  }),
                  e.jsx("span", {
                    className: "font-mono",
                    children: p.toLocaleTimeString("pt-BR"),
                  }),
                ],
              }),
            ],
          }),
          e.jsx("div", {
            className: "relative flex-1 flex flex-col items-center justify-end p-12 pb-16",
            children: e.jsxs("div", {
              className: "max-w-3xl text-center",
              children: [
                e.jsx("p", {
                  className: "text-xs uppercase tracking-[0.3em] text-white/60",
                  children: "Campanha em exibição",
                }),
                e.jsx("h1", {
                  className: "mt-3 font-display text-4xl lg:text-6xl font-bold leading-tight",
                  children: r?.name ?? a.name,
                }),
                r?.description &&
                  e.jsx("p", {
                    className: "mt-4 text-base lg:text-lg text-white/80 max-w-xl mx-auto",
                    children: r.description,
                  }),
              ],
            }),
          }),
          e.jsxs("div", {
            className: "relative px-6 pb-6",
            children: [
              e.jsx("div", {
                className: "flex items-center gap-2",
                children: s.map((t, i) =>
                  e.jsx(
                    "div",
                    {
                      className: "flex-1 h-0.5 rounded-full overflow-hidden bg-white/15",
                      children: e.jsx("div", {
                        className: "h-full bg-white transition-all duration-[5000ms] ease-linear",
                        style: { width: i === l || i < l ? "100%" : "0%" },
                      }),
                    },
                    i,
                  ),
                ),
              }),
              e.jsxs("div", {
                className: "mt-3 flex items-center justify-between text-[11px] text-white/60",
                children: [
                  e.jsxs("span", { children: ["Item ", l + 1, " / ", s.length, " · ", a.name] }),
                  e.jsxs(o, {
                    to: "/app",
                    className: "inline-flex items-center gap-1 hover:text-white transition-colors",
                    children: [e.jsx(I, { className: "h-3 w-3" }), " Sair do modo player"],
                  }),
                ],
              }),
            ],
          }),
        ],
      });
}
export { T as component };

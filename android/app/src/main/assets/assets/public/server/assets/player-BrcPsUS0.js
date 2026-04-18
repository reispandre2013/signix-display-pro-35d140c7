import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { L as Link } from "./router-BfC5KUx0.js";
import { u as useMedia, a as useCampaigns } from "./use-supabase-data-DWtjSxP7.js";
import { g as getMediaUrlCandidates, a as applyMediaFallback } from "./media-url-DiXiTFtW.js";
import { I as Image } from "./image-BY4KT0BQ.js";
import { T as Tv } from "./tv-BGJcO9c3.js";
import { W as Wifi } from "./wifi-CBGefHTs.js";
import { V as Volume2 } from "./volume-2-bb8Bln_g.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.js";
const __iconNode = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "m21 3-7 7", key: "1l2asr" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M9 21H3v-6", key: "wtvkvv" }]
];
const Maximize2 = createLucideIcon("maximize-2", __iconNode);
function PlayerPage() {
  const {
    data: media = []
  } = useMedia();
  const {
    data: campaigns = []
  } = useCampaigns();
  const items = media.filter((m) => m.public_url).slice(0, 6);
  const activeCampaign = campaigns.find((c) => c.status === "active") ?? campaigns[0];
  const [idx, setIdx] = reactExports.useState(0);
  const [now, setNow] = reactExports.useState(/* @__PURE__ */ new Date());
  reactExports.useEffect(() => {
    if (items.length === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 5e3);
    return () => clearInterval(t);
  }, [items.length]);
  reactExports.useEffect(() => {
    const c = setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
    return () => clearInterval(c);
  }, []);
  const current = items[idx];
  const currentSources = current ? getMediaUrlCandidates(current.public_url, current.thumbnail_url) : [];
  if (items.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen w-screen bg-black text-white grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-16 w-16 mx-auto text-white/30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-lg", children: "Nenhuma mídia disponível para reprodução" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/midias", className: "mt-6 inline-block text-primary hover:underline text-sm", children: "Adicionar mídias →" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-screen bg-black text-white flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: currentSources[0] ?? "", "data-sources": JSON.stringify(currentSources), "data-source-index": "0", alt: current.name, className: "w-full h-full object-cover transition-opacity duration-1000", referrerPolicy: "no-referrer", onError: (e) => applyMediaFallback(e.currentTarget) }, `${current.id}-${currentSources[0] ?? "empty"}`),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-between p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-3 py-1.5 ring-1 ring-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "h-4 w-4 text-white/80" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: "Signix Player" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 inline-flex items-center gap-1 text-[10px] text-emerald-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" }),
          " ONLINE"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-white/80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "h-3.5 w-3.5" }),
          " ",
          navigator.onLine ? "Online" : "Offline"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-3.5 w-3.5" }),
          " 60%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: now.toLocaleTimeString("pt-BR") })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex-1 flex flex-col items-center justify-end p-12 pb-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-white/60", children: "Campanha em exibição" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 font-display text-4xl lg:text-6xl font-bold leading-tight", children: activeCampaign?.name ?? current.name }),
      activeCampaign?.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-base lg:text-lg text-white/80 max-w-xl mx-auto", children: activeCampaign.description })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-6 pb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: items.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-0.5 rounded-full overflow-hidden bg-white/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-white transition-all duration-[5000ms] ease-linear", style: {
        width: i === idx ? "100%" : i < idx ? "100%" : "0%"
      } }) }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between text-[11px] text-white/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Item ",
          idx + 1,
          " / ",
          items.length,
          " · ",
          current.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app", className: "inline-flex items-center gap-1 hover:text-white transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-3 w-3" }),
          " Sair do modo player"
        ] })
      ] })
    ] })
  ] });
}
export {
  PlayerPage as component
};

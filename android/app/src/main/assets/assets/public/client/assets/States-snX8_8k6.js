import { j as e } from "./index-DUcMANMA.js";
import { L as o } from "./loader-circle-BffduC8P.js";
import { c as n } from "./createLucideIcon-BDYLgomD.js";
const c = [
    ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }],
    [
      "path",
      {
        d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
        key: "oot6mr",
      },
    ],
  ],
  d = n("inbox", c);
function l({ label: t = "Carregando…" }) {
  return e.jsxs("div", {
    className: "flex items-center justify-center py-16 text-sm text-muted-foreground gap-2",
    children: [e.jsx(o, { className: "h-4 w-4 animate-spin" }), " ", t],
  });
}
function u({ title: t, description: s, action: r, icon: a = d }) {
  return e.jsxs("div", {
    className: "flex flex-col items-center justify-center py-16 text-center px-6",
    children: [
      e.jsx("div", {
        className:
          "h-12 w-12 rounded-full bg-muted/50 grid place-items-center text-muted-foreground mb-3",
        children: e.jsx(a, { className: "h-5 w-5" }),
      }),
      e.jsx("p", { className: "text-sm font-semibold", children: t }),
      s && e.jsx("p", { className: "text-xs text-muted-foreground mt-1 max-w-sm", children: s }),
      r && e.jsx("div", { className: "mt-4", children: r }),
    ],
  });
}
function f({ error: t }) {
  const s = t instanceof Error ? t.message : "Erro desconhecido";
  return e.jsxs("div", {
    className:
      "rounded-md border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive",
    children: ["Falha ao carregar dados: ", s],
  });
}
export { u as E, l as L, f as a };

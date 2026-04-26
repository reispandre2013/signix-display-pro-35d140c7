import { r as a, j as r } from "./index-DUcMANMA.js";
import { X as d } from "./x-Dpfm6mfs.js";
function p({ open: e, onClose: t, title: n, children: o }) {
  return e
    ? r.jsx("div", {
        className:
          "fixed inset-0 z-50 grid place-items-center p-4 bg-background/80 backdrop-blur-sm",
        onClick: t,
        children: r.jsxs("div", {
          className: "w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-elegant",
          onClick: (s) => s.stopPropagation(),
          children: [
            r.jsxs("div", {
              className: "flex items-center justify-between mb-4",
              children: [
                r.jsx("h3", { className: "font-display text-lg font-bold", children: n }),
                r.jsx("button", {
                  onClick: t,
                  className: "h-8 w-8 grid place-items-center rounded-md hover:bg-accent",
                  children: r.jsx(d, { className: "h-4 w-4" }),
                }),
              ],
            }),
            o,
          ],
        }),
      })
    : null;
}
function b({ label: e, children: t }) {
  return r.jsxs("div", {
    children: [
      r.jsx("label", {
        className: "text-xs font-medium text-muted-foreground mb-1.5 block",
        children: e,
      }),
      t,
    ],
  });
}
function g(e) {
  return r.jsx("input", {
    ...e,
    className:
      "w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
  });
}
function h(e) {
  return r.jsx("textarea", {
    ...e,
    className:
      "w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent min-h-[80px]",
  });
}
function j({ children: e, ...t }) {
  return r.jsx("button", {
    ...t,
    className:
      "inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-60",
    children: e,
  });
}
function y(e) {
  const [t, n] = a.useState(!1),
    [o, s] = a.useState(e);
  return {
    open: t,
    setOpen: n,
    values: o,
    set: (i, c) => s((u) => ({ ...u, [i]: c })),
    reset: () => s(e),
  };
}
export { b as F, p as M, j as P, g as T, h as a, y as u };

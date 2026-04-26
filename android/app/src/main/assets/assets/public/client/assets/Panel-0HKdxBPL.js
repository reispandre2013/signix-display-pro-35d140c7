import { j as e } from "./index-DUcMANMA.js";
import { c as a } from "./utils-BQHNewu7.js";
function n({ title: r, description: d, actions: s, children: o, className: t, bodyClassName: x }) {
  return e.jsxs("section", {
    className: a("rounded-xl border border-border bg-card shadow-card overflow-hidden", t),
    children: [
      (r || s) &&
        e.jsxs("header", {
          className: "flex items-start justify-between gap-3 px-5 py-4 border-b border-border",
          children: [
            e.jsxs("div", {
              children: [
                r && e.jsx("h3", { className: "font-display text-sm font-semibold", children: r }),
                d && e.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: d }),
              ],
            }),
            s && e.jsx("div", { className: "flex items-center gap-2", children: s }),
          ],
        }),
      e.jsx("div", { className: a("p-5", x), children: o }),
    ],
  });
}
export { n as P };

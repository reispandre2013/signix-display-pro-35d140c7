import { U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
function PageHeader({
  title,
  subtitle,
  actions
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl lg:text-3xl font-bold tracking-tight", children: title }),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-muted-foreground max-w-2xl", children: subtitle })
    ] }),
    actions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 flex-wrap", children: actions })
  ] });
}
export {
  PageHeader as P
};

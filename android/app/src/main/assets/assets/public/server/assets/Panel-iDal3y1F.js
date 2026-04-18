import { U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { c as cn } from "./utils-Bz4m9VPB.js";
function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: cn("rounded-xl border border-border bg-card shadow-card overflow-hidden", className), children: [
    (title || actions) && /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-start justify-between gap-3 px-5 py-4 border-b border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        title && /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-sm font-semibold", children: title }),
        description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: description })
      ] }),
      actions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: actions })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("p-5", bodyClassName), children })
  ] });
}
export {
  Panel as P
};

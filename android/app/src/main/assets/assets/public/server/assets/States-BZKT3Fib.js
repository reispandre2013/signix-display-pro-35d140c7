import { U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { L as LoaderCircle } from "./loader-circle-DWZmQ-AH.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
const __iconNode = [
  ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }],
  [
    "path",
    {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      key: "oot6mr"
    }
  ]
];
const Inbox = createLucideIcon("inbox", __iconNode);
function LoadingState({ label = "Carregando…" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-16 text-sm text-muted-foreground gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
    " ",
    label
  ] });
}
function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-muted/50 grid place-items-center text-muted-foreground mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: title }),
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 max-w-sm", children: description }),
    action && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: action })
  ] });
}
function ErrorState({ error }) {
  const msg = error instanceof Error ? error.message : "Erro desconhecido";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive", children: [
    "Falha ao carregar dados: ",
    msg
  ] });
}
export {
  EmptyState as E,
  LoadingState as L,
  ErrorState as a
};

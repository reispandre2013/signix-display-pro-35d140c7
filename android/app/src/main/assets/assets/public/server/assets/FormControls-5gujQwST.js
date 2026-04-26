import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { X } from "./x-Vv-VrOr6.js";
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "fixed inset-0 z-50 grid place-items-center p-4 bg-background/80 backdrop-blur-sm",
    onClick: onClose,
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-elegant",
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "flex items-center justify-between mb-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", {
              className: "font-display text-lg font-bold",
              children: title,
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
              onClick: onClose,
              className: "h-8 w-8 grid place-items-center rounded-md hover:bg-accent",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
            }),
          ],
        }),
        children,
      ],
    }),
  });
}
function FormField({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", {
        className: "text-xs font-medium text-muted-foreground mb-1.5 block",
        children: label,
      }),
      children,
    ],
  });
}
function TextInput(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("input", {
    ...props,
    className:
      "w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
  });
}
function TextArea(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", {
    ...props,
    className:
      "w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent min-h-[80px]",
  });
}
function PrimaryButton({ children, ...rest }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
    ...rest,
    className:
      "inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-60",
    children,
  });
}
function useModalForm(initial) {
  const [open, setOpen] = reactExports.useState(false);
  const [values, setValues] = reactExports.useState(initial);
  const reset = () => setValues(initial);
  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }));
  return { open, setOpen, values, set, reset };
}
export {
  FormField as F,
  Modal as M,
  PrimaryButton as P,
  TextInput as T,
  TextArea as a,
  useModalForm as u,
};

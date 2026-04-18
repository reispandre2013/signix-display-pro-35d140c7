import { U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { c as cn } from "./utils-Bz4m9VPB.js";
const tones = {
  online: "bg-success/10 text-success ring-success/30",
  offline: "bg-destructive/10 text-destructive ring-destructive/30",
  warning: "bg-warning/10 text-warning ring-warning/30",
  syncing: "bg-info/10 text-info ring-info/30",
  neutral: "bg-muted text-muted-foreground ring-border",
  primary: "bg-primary/10 text-primary ring-primary/30",
  success: "bg-success/10 text-success ring-success/30",
  destructive: "bg-destructive/10 text-destructive ring-destructive/30",
  info: "bg-info/10 text-info ring-info/30"
};
const labels = {
  online: "Online",
  offline: "Offline",
  warning: "Atenção",
  syncing: "Sincronizando"
};
function StatusBadge({ status, label, tone, withDot = true }) {
  const t = tone ?? status ?? "neutral";
  const text = label ?? (status ? labels[status] ?? status : "—");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset", tones[t] ?? tones.neutral), children: [
    withDot && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("h-1.5 w-1.5 rounded-full bg-current", t === "online" && "pulse-dot") }),
    text
  ] });
}
export {
  StatusBadge as S
};

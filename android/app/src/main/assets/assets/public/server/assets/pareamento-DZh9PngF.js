import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { L as Link } from "./router-BfC5KUx0.js";
import { C as Cpu, c as createPairingCode, a as checkPairingStatus } from "./screens.functions-Cx9bWxwm.js";
import { T as Tv } from "./tv-BGJcO9c3.js";
import { A as ArrowLeft } from "./arrow-left-DvrWNxg2.js";
import { L as LoaderCircle } from "./loader-circle-DWZmQ-AH.js";
import { M as Monitor } from "./monitor-4tjVPwPf.js";
import { W as Wifi } from "./wifi-CBGefHTs.js";
import { R as RefreshCw } from "./refresh-cw-Dj7JKiR8.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.js";
import "./createLucideIcon-DUXbX0Xj.js";
import "./createSsrRpc-BdiZaWN2.js";
const STORAGE_KEY = "signix_pairing_code";
const STORAGE_EXP_KEY = "signix_pairing_code_exp";
function PairingPage() {
  const [code, setCode] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [paired, setPaired] = reactExports.useState(false);
  const [codeError, setCodeError] = reactExports.useState(null);
  const generateCode = async () => {
    setLoading(true);
    setCodeError(null);
    try {
      const res = await createPairingCode();
      if (res?.code) {
        localStorage.setItem(STORAGE_KEY, res.code);
        if (res.expires_at) localStorage.setItem(STORAGE_EXP_KEY, res.expires_at);
        setCode(res.code);
      } else {
        throw new Error("Resposta inválida do servidor.");
      }
    } catch (e) {
      console.error("[pareamento] generateCode failed:", e);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_EXP_KEY);
      setCode(null);
      const msg = e instanceof Error ? e.message : String(e);
      setCodeError(msg && msg !== "HTTPError" ? msg : "Não foi possível registrar o código de pareamento. Verifique a conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedExp = localStorage.getItem(STORAGE_EXP_KEY);
    const stillValid = stored && storedExp && new Date(storedExp).getTime() > Date.now() + 3e4;
    if (stillValid) {
      setCode(stored);
      setLoading(false);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_EXP_KEY);
      generateCode();
    }
  }, []);
  reactExports.useEffect(() => {
    if (!code || paired) return;
    let cancelled = false;
    const check = async () => {
      try {
        const res = await checkPairingStatus({
          data: {
            code
          }
        });
        if (!cancelled && res?.paired) {
          setPaired(true);
        }
      } catch {
      }
    };
    check();
    const interval = setInterval(check, 4e3);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [code, paired]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col bg-background bg-mesh", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "h-5 w-5 text-primary-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg font-bold", children: "Signix Player" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
        " Painel administrativo"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 grid place-items-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-xl text-center", children: paired ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 text-success px-3 py-1 text-xs", children: "✓ Dispositivo pareado com sucesso" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-6 font-display text-3xl lg:text-4xl font-bold leading-tight", children: [
        "Tudo pronto!",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "Aguardando primeira campanha…"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-success pulse-dot" }),
        " Aguardando confirmação no painel"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-6 font-display text-3xl lg:text-4xl font-bold leading-tight", children: [
        "Use o código abaixo para parear",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "este dispositivo à sua conta"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-muted-foreground max-w-md mx-auto text-sm", children: [
        "Acesse ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: "Telas › Adicionar tela" }),
        " no painel Signix e informe o código exibido."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-8 py-6 shadow-glow min-h-[120px]", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-10 w-10 animate-spin text-primary" }) : codeError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-sm text-sm text-destructive", children: codeError }) : code ? code.split("").map((c, i) => c === "-" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-4xl text-muted-foreground", children: "·" }, i) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-5xl font-bold text-gradient w-10 text-center", children: c }, i)) : null }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid sm:grid-cols-3 gap-3 max-w-md mx-auto text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { icon: Monitor, label: "Resolução", value: `${window.screen.width} × ${window.screen.height}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { icon: Cpu, label: "Plataforma", value: navigator.platform || "Web" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { icon: Wifi, label: "Conexão", value: navigator.onLine ? "Online" : "Offline" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_EXP_KEY);
        generateCode();
      }, disabled: loading, className: "mt-8 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-accent transition-smooth disabled:opacity-60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
        " Gerar novo código"
      ] })
    ] }) }) })
  ] });
}
function Info({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card/60 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm font-medium truncate", children: value })
  ] });
}
export {
  PairingPage as component
};

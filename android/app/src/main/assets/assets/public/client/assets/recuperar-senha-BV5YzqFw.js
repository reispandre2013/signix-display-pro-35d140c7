import { r as i, u as c, j as e, L as u, s as p, t as n } from "./index-DUcMANMA.js";
import { T as x } from "./tv-qkDTjJdC.js";
import { M as g } from "./mail-Dxt7XpX_.js";
import { L as f } from "./loader-circle-BffduC8P.js";
import { A as h } from "./arrow-left-CluiURL3.js";
import "./createLucideIcon-BDYLgomD.js";
function E() {
  const [s, l] = i.useState(""),
    [t, a] = i.useState(!1),
    m = c(),
    d = async (r) => {
      if ((r.preventDefault(), !s)) return;
      a(!0);
      const { error: o } = await p.auth.resetPasswordForEmail(s.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if ((a(!1), o)) {
        n.error(o.message);
        return;
      }
      (n.success("Link de recuperação enviado! Verifique seu e-mail."),
        setTimeout(() => m({ to: "/login" }), 1500));
    };
  return e.jsx("div", {
    className: "min-h-screen grid place-items-center bg-background bg-mesh p-6",
    children: e.jsxs("div", {
      className: "w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elegant",
      children: [
        e.jsxs("div", {
          className: "flex items-center gap-2.5 mb-6",
          children: [
            e.jsx("div", {
              className:
                "h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow",
              children: e.jsx(x, { className: "h-5 w-5 text-primary-foreground" }),
            }),
            e.jsx("p", { className: "font-display text-xl font-bold", children: "Signix" }),
          ],
        }),
        e.jsx("h1", { className: "font-display text-2xl font-bold", children: "Recuperar senha" }),
        e.jsx("p", {
          className: "text-sm text-muted-foreground mt-1.5",
          children: "Informe seu e-mail. Enviaremos um link seguro para redefinir sua senha.",
        }),
        e.jsxs("form", {
          onSubmit: d,
          className: "mt-6 space-y-4",
          children: [
            e.jsxs("div", {
              children: [
                e.jsx("label", {
                  className: "text-xs font-medium text-muted-foreground mb-1.5 block",
                  children: "E-mail",
                }),
                e.jsxs("div", {
                  className: "relative",
                  children: [
                    e.jsx(g, {
                      className:
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                    }),
                    e.jsx("input", {
                      type: "email",
                      required: !0,
                      value: s,
                      onChange: (r) => l(r.target.value),
                      placeholder: "voce@empresa.com",
                      className:
                        "w-full rounded-lg border border-input bg-surface pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth",
                    }),
                  ],
                }),
              ],
            }),
            e.jsx("button", {
              type: "submit",
              disabled: t,
              className:
                "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition-smooth disabled:opacity-60",
              children: t
                ? e.jsx(f, { className: "h-4 w-4 animate-spin" })
                : "Enviar link de recuperação",
            }),
          ],
        }),
        e.jsxs(u, {
          to: "/login",
          className:
            "mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-smooth",
          children: [e.jsx(h, { className: "h-3.5 w-3.5" }), " Voltar para login"],
        }),
      ],
    }),
  });
}
export { E as component };

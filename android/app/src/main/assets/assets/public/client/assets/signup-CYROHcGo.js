import { r, u as j, a as v, j as e, L as N, t as d } from "./index-DUcMANMA.js";
import { T as w } from "./tv-qkDTjJdC.js";
import { U as y } from "./user-DpkrebEC.js";
import { B as S } from "./building-2-L8uGa92d.js";
import { M as C } from "./mail-Dxt7XpX_.js";
import { L as E } from "./lock-ZHRdkGWQ.js";
import { L } from "./loader-circle-BffduC8P.js";
import { A as q } from "./arrow-right-DA0qr8cc.js";
import "./createLucideIcon-BDYLgomD.js";
function T() {
  const [s, i] = r.useState(""),
    [t, l] = r.useState(""),
    [o, c] = r.useState(""),
    [a, m] = r.useState(""),
    [u, p] = r.useState(!1),
    g = j(),
    { signUp: f } = v(),
    h = async (b) => {
      if ((b.preventDefault(), a.length < 6)) {
        d.error("Senha deve ter ao menos 6 caracteres.");
        return;
      }
      p(!0);
      const { error: x } = await f(o.trim(), a, s.trim(), t.trim());
      if ((p(!1), x)) {
        d.error(x.message ?? "Não foi possível criar a conta.");
        return;
      }
      (d.success("Conta criada! Verifique seu e-mail se a confirmação estiver ativada."),
        g({ to: "/app", replace: !0 }));
    };
  return e.jsx("div", {
    className: "min-h-screen grid place-items-center bg-background bg-mesh p-6",
    children: e.jsxs("div", {
      className: "w-full max-w-md",
      children: [
        e.jsxs("div", {
          className: "mb-8 flex items-center gap-2.5",
          children: [
            e.jsx("div", {
              className:
                "h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow",
              children: e.jsx(w, { className: "h-5 w-5 text-primary-foreground" }),
            }),
            e.jsx("p", { className: "font-display text-xl font-bold", children: "Signix" }),
          ],
        }),
        e.jsx("h2", { className: "font-display text-2xl font-bold", children: "Criar nova conta" }),
        e.jsxs("p", {
          className: "text-sm text-muted-foreground mt-1",
          children: [
            "Você será o ",
            e.jsx("span", { className: "text-foreground font-semibold", children: "Admin Master" }),
            " da nova organização.",
          ],
        }),
        e.jsxs("form", {
          onSubmit: h,
          className: "mt-8 space-y-4",
          children: [
            e.jsx(n, {
              icon: y,
              label: "Seu nome",
              value: s,
              onChange: i,
              required: !0,
              placeholder: "Ana Souza",
            }),
            e.jsx(n, {
              icon: S,
              label: "Nome da organização",
              value: t,
              onChange: l,
              required: !0,
              placeholder: "Minha Empresa",
            }),
            e.jsx(n, {
              icon: C,
              label: "E-mail",
              type: "email",
              value: o,
              onChange: c,
              required: !0,
              placeholder: "voce@empresa.com",
            }),
            e.jsx(n, {
              icon: E,
              label: "Senha (mín. 6 caracteres)",
              type: "password",
              value: a,
              onChange: m,
              required: !0,
              placeholder: "••••••••",
            }),
            e.jsx("button", {
              type: "submit",
              disabled: u,
              className:
                "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-60",
              children: u
                ? e.jsx(L, { className: "h-4 w-4 animate-spin" })
                : e.jsxs(e.Fragment, {
                    children: ["Criar conta ", e.jsx(q, { className: "h-4 w-4" })],
                  }),
            }),
            e.jsxs("p", {
              className: "text-center text-xs text-muted-foreground",
              children: [
                "Já tem conta? ",
                e.jsx(N, {
                  to: "/login",
                  className: "text-primary hover:underline",
                  children: "Entrar",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function n({
  icon: s,
  label: i,
  value: t,
  onChange: l,
  type: o = "text",
  required: c,
  placeholder: a,
}) {
  return e.jsxs("div", {
    children: [
      e.jsx("label", {
        className: "text-xs font-medium text-muted-foreground mb-1.5 block",
        children: i,
      }),
      e.jsxs("div", {
        className: "relative",
        children: [
          e.jsx(s, {
            className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
          }),
          e.jsx("input", {
            type: o,
            required: c,
            value: t,
            onChange: (m) => l(m.target.value),
            placeholder: a,
            className:
              "w-full rounded-lg border border-input bg-surface pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
          }),
        ],
      }),
    ],
  });
}
export { T as component };

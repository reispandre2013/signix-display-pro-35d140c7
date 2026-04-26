import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { u as useNavigate, L as Link, s as supabase, t as toast } from "./router-BfC5KUx0.js";
import { T as Tv } from "./tv-BGJcO9c3.js";
import { M as Mail } from "./mail-C3nK1-bX.js";
import { L as LoaderCircle } from "./loader-circle-DWZmQ-AH.js";
import { A as ArrowLeft } from "./arrow-left-DvrWNxg2.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.js";
import "./createLucideIcon-DUXbX0Xj.js";
function RecoverPage() {
  const [email, setEmail] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Link de recuperação enviado! Verifique seu e-mail.");
    setTimeout(
      () =>
        navigate({
          to: "/login",
        }),
      1500,
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "min-h-screen grid place-items-center bg-background bg-mesh p-6",
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elegant",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "flex items-center gap-2.5 mb-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className:
                "h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, {
                className: "h-5 w-5 text-primary-foreground",
              }),
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className: "font-display text-xl font-bold",
              children: "Signix",
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
          className: "font-display text-2xl font-bold",
          children: "Recuperar senha",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "text-sm text-muted-foreground mt-1.5",
          children: "Informe seu e-mail. Enviaremos um link seguro para redefinir sua senha.",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
          onSubmit,
          className: "mt-6 space-y-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", {
                  className: "text-xs font-medium text-muted-foreground mb-1.5 block",
                  children: "E-mail",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "relative",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, {
                      className:
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", {
                      type: "email",
                      required: true,
                      value: email,
                      onChange: (e) => setEmail(e.target.value),
                      placeholder: "voce@empresa.com",
                      className:
                        "w-full rounded-lg border border-input bg-surface pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth",
                    }),
                  ],
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
              type: "submit",
              disabled: submitting,
              className:
                "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition-smooth disabled:opacity-60",
              children: submitting
                ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, {
                    className: "h-4 w-4 animate-spin",
                  })
                : "Enviar link de recuperação",
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, {
          to: "/login",
          className:
            "mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-smooth",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
            " Voltar para login",
          ],
        }),
      ],
    }),
  });
}
export { RecoverPage as component };

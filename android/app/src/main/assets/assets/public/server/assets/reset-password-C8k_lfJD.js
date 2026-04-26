import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { u as useNavigate, t as toast, s as supabase } from "./router-BfC5KUx0.js";
import { T as Tv } from "./tv-BGJcO9c3.js";
import { L as Lock } from "./lock-Dtnrjfkd.js";
import { L as LoaderCircle } from "./loader-circle-DWZmQ-AH.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.js";
import "./createLucideIcon-DUXbX0Xj.js";
function ResetPasswordPage() {
  const [password, setPassword] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Senha deve ter ao menos 6 caracteres.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({
      password,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha atualizada com sucesso!");
    navigate({
      to: "/app",
      replace: true,
    });
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
          children: "Definir nova senha",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "text-sm text-muted-foreground mt-1.5",
          children: "Escolha uma senha forte com pelo menos 6 caracteres.",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
          onSubmit,
          className: "mt-6 space-y-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", {
                  className: "text-xs font-medium text-muted-foreground mb-1.5 block",
                  children: "Nova senha",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "relative",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, {
                      className:
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", {
                      type: "password",
                      required: true,
                      value: password,
                      onChange: (e) => setPassword(e.target.value),
                      placeholder: "••••••••",
                      className:
                        "w-full rounded-lg border border-input bg-surface pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                    }),
                  ],
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
              type: "submit",
              disabled: submitting,
              className:
                "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-60",
              children: submitting
                ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, {
                    className: "h-4 w-4 animate-spin",
                  })
                : "Atualizar senha",
            }),
          ],
        }),
      ],
    }),
  });
}
export { ResetPasswordPage as component };

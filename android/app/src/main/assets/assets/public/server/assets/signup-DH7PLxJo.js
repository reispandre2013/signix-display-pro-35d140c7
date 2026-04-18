import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { u as useNavigate, a as useAuth, L as Link, t as toast } from "./router-BfC5KUx0.js";
import { T as Tv } from "./tv-BGJcO9c3.js";
import { U as User } from "./user-BVQ1qz6K.js";
import { B as Building2 } from "./building-2-DAzKcuho.js";
import { M as Mail } from "./mail-C3nK1-bX.js";
import { L as Lock } from "./lock-Dtnrjfkd.js";
import { L as LoaderCircle } from "./loader-circle-DWZmQ-AH.js";
import { A as ArrowRight } from "./arrow-right-pyLYeR4E.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.js";
import "./createLucideIcon-DUXbX0Xj.js";
function SignupPage() {
  const [name, setName] = reactExports.useState("");
  const [orgName, setOrgName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const navigate = useNavigate();
  const {
    signUp
  } = useAuth();
  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Senha deve ter ao menos 6 caracteres.");
      return;
    }
    setSubmitting(true);
    const {
      error
    } = await signUp(email.trim(), password, name.trim(), orgName.trim());
    setSubmitting(false);
    if (error) {
      toast.error(error.message ?? "Não foi possível criar a conta.");
      return;
    }
    toast.success("Conta criada! Verifique seu e-mail se a confirmação estiver ativada.");
    navigate({
      to: "/app",
      replace: true
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center bg-background bg-mesh p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex items-center gap-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "h-5 w-5 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-bold", children: "Signix" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold", children: "Criar nova conta" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
      "Você será o ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-semibold", children: "Admin Master" }),
      " da nova organização."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: User, label: "Seu nome", value: name, onChange: setName, required: true, placeholder: "Ana Souza" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: Building2, label: "Nome da organização", value: orgName, onChange: setOrgName, required: true, placeholder: "Minha Empresa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: Mail, label: "E-mail", type: "email", value: email, onChange: setEmail, required: true, placeholder: "voce@empresa.com" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: Lock, label: "Senha (mín. 6 caracteres)", type: "password", value: password, onChange: setPassword, required: true, placeholder: "••••••••" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: submitting, className: "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-60", children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Criar conta ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground", children: [
        "Já tem conta? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-primary hover:underline", children: "Entrar" })
      ] })
    ] })
  ] }) });
}
function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1.5 block", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, required, value, onChange: (e) => onChange(e.target.value), placeholder, className: "w-full rounded-lg border border-input bg-surface pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" })
    ] })
  ] });
}
export {
  SignupPage as component
};

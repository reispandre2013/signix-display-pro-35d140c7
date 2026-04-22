import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FALLBACK_SUPABASE_URL = "https://auhwylnhqmdgphsvjszr.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1aHd5bG5ocW1kZ3Boc3Zqc3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTcxNTQsImV4cCI6MjA5MTg3MzE1NH0.NNHIM43GJyOYYSjgZX3F1o5Pk_WrEx8xYzIrZpJt3kw";

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  FALLBACK_SUPABASE_ANON_KEY;

type PublicRole = "operador" | "visualizador";

interface PublicSignupInput {
  email: string;
  password: string;
  name: string;
  org_token: string;
  role: PublicRole;
}

function randomTokenHex(byteLength = 24): string {
  const bytes = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function validatePublicSignup(input: unknown): PublicSignupInput {
  if (typeof input !== "object" || input === null) throw new Error("Payload inválido.");
  const o = input as Record<string, unknown>;
  const email = typeof o.email === "string" ? o.email.trim().toLowerCase() : "";
  const password = typeof o.password === "string" ? o.password : "";
  const name = typeof o.name === "string" ? o.name.trim() : "";
  const org_token = typeof o.org_token === "string" ? o.org_token.trim() : "";
  const roleRaw = o.role;
  const role: PublicRole = roleRaw === "visualizador" ? "visualizador" : "operador";
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("E-mail inválido.");
  if (password.length < 6) throw new Error("Senha precisa de ao menos 6 caracteres.");
  if (name.length < 2) throw new Error("Nome inválido.");
  if (org_token.length < 8) {
    throw new Error("Informe o código da organização (fornecido pelo Admin Master).");
  }
  return { email, password, name, org_token, role };
}

/**
 * Cadastro público: apenas Operador ou Visualizador, vinculado à org pelo código secreto.
 * Nunca cria Admin Master ou Gestor por esta rota.
 */
export const registerPublicEmployee = createServerFn({ method: "POST" })
  .inputValidator(validatePublicSignup)
  .handler(async ({ data }) => {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error(
        "Servidor sem SERVICE_ROLE_KEY / SUPABASE_URL. O administrador deve configurar o ambiente.",
      );
    }

    const { data: org, error: orgErr } = await supabaseAdmin
      .from("organizations")
      .select("id, status")
      .eq("employee_signup_token", data.org_token)
      .maybeSingle();
    if (orgErr) throw new Error(orgErr.message);
    if (!org || org.status !== "active") {
      throw new Error("Código da organização inválido ou empresa inativa.");
    }

    const orgId = org.id as string;

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { name: data.name, organization_id: orgId, role: data.role },
    });
    if (createErr) {
      const msg = createErr.message ?? "";
      if (/already|registered|exists/i.test(msg)) {
        throw new Error("Este e-mail já está cadastrado. Use outro e-mail ou recuperação de senha.");
      }
      throw new Error(msg || "Falha ao criar conta.");
    }
    if (!created.user) throw new Error("Falha ao criar conta.");
    const newAuthUserId = created.user.id;

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("auth_user_id", newAuthUserId)
      .maybeSingle();

    try {
      if (existingProfile) {
        const { error: updErr } = await supabaseAdmin
          .from("profiles")
          .update({
            organization_id: orgId,
            name: data.name,
            email: data.email,
            role: data.role,
            status: "active",
          })
          .eq("id", existingProfile.id);
        if (updErr) throw new Error(updErr.message);
      } else {
        const { error: insErr } = await supabaseAdmin.from("profiles").insert({
          auth_user_id: newAuthUserId,
          organization_id: orgId,
          name: data.name,
          email: data.email,
          role: data.role,
          status: "active",
        });
        if (insErr) {
          if (String(insErr.code) === "23505") {
            throw new Error("Este e-mail já está em uso nesta organização.");
          }
          throw new Error(insErr.message);
        }
      }
    } catch (e) {
      await supabaseAdmin.auth.admin.deleteUser(newAuthUserId).catch(() => {});
      throw e instanceof Error ? e : new Error("Falha ao criar perfil.");
    }

    const { data: verify, error: verErr } = await supabaseAdmin
      .from("profiles")
      .select("id, organization_id")
      .eq("auth_user_id", newAuthUserId)
      .maybeSingle();
    if (verErr || !verify || verify.organization_id !== orgId) {
      await supabaseAdmin.auth.admin.deleteUser(newAuthUserId).catch(() => {});
      throw new Error("Não foi possível confirmar o cadastro. Tente novamente.");
    }

    return { ok: true as const, email: data.email, role: data.role };
  });

function validateEmpty(_input: unknown): Record<string, never> {
  return {};
}

/**
 * Gera novo código de cadastro público (invalida o anterior). Apenas Admin Master.
 */
export const rotateEmployeeSignupToken = createServerFn({ method: "POST" })
  .inputValidator(validateEmpty)
  .handler(async () => {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error("Servidor sem SERVICE_ROLE_KEY / SUPABASE_URL.");
    }
    if (!ANON_KEY) throw new Error("Servidor sem chave anônima Supabase.");

    const authHeader = getRequestHeader("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Não autenticado.");

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) throw new Error("Sessão inválida.");
    const callerAuthId = userData.user.id;

    const { data: callerProfile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, role, organization_id")
      .eq("auth_user_id", callerAuthId)
      .maybeSingle();
    if (profileErr) throw new Error(profileErr.message);
    if (!callerProfile) throw new Error("Perfil não encontrado.");
    if (callerProfile.role !== "admin_master") {
      throw new Error("Apenas Admin Master pode gerar um novo código.");
    }

    const orgId = callerProfile.organization_id as string;
    const newToken = randomTokenHex(24);

    const { error: updErr } = await supabaseAdmin
      .from("organizations")
      .update({ employee_signup_token: newToken })
      .eq("id", orgId);
    if (updErr) throw new Error(updErr.message);

    return { ok: true as const, employee_signup_token: newToken };
  });

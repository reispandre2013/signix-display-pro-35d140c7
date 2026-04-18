import { c as createServerRpc, s as supabaseAdmin } from "./client.server-CJaNE3EK.js";
import { c as createClient } from "./index-Cf78ubZ7.js";
import { $ as createServerFn, a0 as getRequestHeader } from "./worker-entry-CFvqOeOX.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "";
function validate(input) {
  if (typeof input !== "object" || input === null) throw new Error("Payload inválido.");
  const {
    email,
    name,
    role,
    mode,
    password
  } = input;
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("E-mail inválido.");
  if (typeof name !== "string" || name.trim().length < 2) throw new Error("Nome inválido.");
  if (role !== "admin_master" && role !== "gestor" && role !== "operador" && role !== "visualizador") throw new Error("Perfil inválido.");
  if (mode !== "password" && mode !== "invite") throw new Error("Modo inválido.");
  if (mode === "password" && (typeof password !== "string" || password.length < 6)) throw new Error("Senha precisa de ao menos 6 caracteres.");
  return {
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role,
    mode,
    password: typeof password === "string" ? password : void 0
  };
}
const createOrgUser_createServerFn_handler = createServerRpc({
  id: "87d50a556753addcefbdda31b8f189739a7e7ba567a86abb808902c789a15842",
  name: "createOrgUser",
  filename: "src/lib/server/users.functions.ts"
}, (opts) => createOrgUser.__executeServer(opts));
const createOrgUser = createServerFn({
  method: "POST"
}).inputValidator(validate).handler(createOrgUser_createServerFn_handler, async ({
  data
}) => {
  const authHeader = getRequestHeader("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Não autenticado.");
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  const {
    data: userData,
    error: userErr
  } = await userClient.auth.getUser();
  if (userErr || !userData.user) throw new Error("Sessão inválida.");
  const callerAuthId = userData.user.id;
  const {
    data: callerProfile,
    error: profileErr
  } = await supabaseAdmin.from("profiles").select("id, role, organization_id").eq("auth_user_id", callerAuthId).maybeSingle();
  if (profileErr) throw new Error(profileErr.message);
  if (!callerProfile) throw new Error("Perfil do solicitante não encontrado.");
  if (callerProfile.role !== "admin_master") throw new Error("Apenas Admin Master pode criar usuários.");
  const orgId = callerProfile.organization_id;
  let newAuthUserId;
  if (data.mode === "password") {
    const {
      data: created,
      error: createErr
    } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        name: data.name,
        organization_id: orgId,
        role: data.role
      }
    });
    if (createErr || !created.user) throw new Error(createErr?.message ?? "Falha ao criar usuário.");
    newAuthUserId = created.user.id;
  } else {
    const redirectTo = (process.env.PUBLIC_APP_URL ?? process.env.VITE_PUBLIC_APP_URL ?? "") + "/app";
    const {
      data: invited,
      error: inviteErr
    } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: {
        name: data.name,
        organization_id: orgId,
        role: data.role
      },
      redirectTo: redirectTo || void 0
    });
    if (inviteErr || !invited.user) throw new Error(inviteErr?.message ?? "Falha ao enviar convite.");
    newAuthUserId = invited.user.id;
  }
  const {
    data: existingProfile
  } = await supabaseAdmin.from("profiles").select("id").eq("auth_user_id", newAuthUserId).maybeSingle();
  if (existingProfile) {
    const {
      error: updErr
    } = await supabaseAdmin.from("profiles").update({
      organization_id: orgId,
      name: data.name,
      email: data.email,
      role: data.role,
      status: "active"
    }).eq("id", existingProfile.id);
    if (updErr) throw new Error(updErr.message);
  } else {
    const {
      error: insErr
    } = await supabaseAdmin.from("profiles").insert({
      auth_user_id: newAuthUserId,
      organization_id: orgId,
      name: data.name,
      email: data.email,
      role: data.role,
      status: "active"
    });
    if (insErr) throw new Error(insErr.message);
  }
  return {
    ok: true,
    mode: data.mode,
    email: data.email
  };
});
export {
  createOrgUser_createServerFn_handler
};

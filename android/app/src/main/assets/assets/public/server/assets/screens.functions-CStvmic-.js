import { c as createServerRpc, s as supabaseAdmin } from "./client.server-CJaNE3EK.js";
import { c as createClient } from "./index-Cf78ubZ7.js";
import { $ as createServerFn, a0 as getRequestHeader } from "./worker-entry-CFvqOeOX.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://auhwylnhqmdgphsvjszr.supabase.co" ?? "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1aHd5bG5ocW1kZ3Boc3Zqc3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTcxNTQsImV4cCI6MjA5MTg3MzE1NH0.NNHIM43GJyOYYSjgZX3F1o5Pk_WrEx8xYzIrZpJt3kw" ?? void 0 ?? "";
function normalizeCode(raw) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}
function toScreenOrientation(orientation) {
  return orientation === "landscape" ? "horizontal" : "vertical";
}
function validate(input) {
  if (typeof input !== "object" || input === null) throw new Error("Payload inválido.");
  const {
    code,
    name,
    unit_id,
    orientation
  } = input;
  if (typeof code !== "string" || normalizeCode(code).length < 6) throw new Error("Código de pareamento inválido.");
  if (typeof name !== "string" || name.trim().length < 2) throw new Error("Informe um nome para a tela.");
  if (orientation !== "landscape" && orientation !== "portrait") throw new Error("Orientação inválida.");
  return {
    code: normalizeCode(code),
    name: name.trim(),
    unit_id: typeof unit_id === "string" && unit_id.length > 0 ? unit_id : null,
    orientation
  };
}
const claimPairingCode_createServerFn_handler = createServerRpc({
  id: "6386b86a2fd8e8f0fed58b3c0a030b1caf0a3fee64720726efb088e0ae319e6d",
  name: "claimPairingCode",
  filename: "src/lib/server/screens.functions.ts"
}, (opts) => claimPairingCode.__executeServer(opts));
const claimPairingCode = createServerFn({
  method: "POST"
}).inputValidator(validate).handler(claimPairingCode_createServerFn_handler, async ({
  data
}) => {
  if (!SUPABASE_URL || !ANON_KEY) {
    console.error("[claimPairingCode] Supabase URL ou anon key ausentes no runtime.");
    throw new Error("Configuração do servidor incompleta para realizar o pareamento.");
  }
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
    data: profile,
    error: profileErr
  } = await supabaseAdmin.from("profiles").select("id, role, organization_id").eq("auth_user_id", callerAuthId).maybeSingle();
  if (profileErr) throw new Error(profileErr.message);
  if (!profile) throw new Error("Perfil não encontrado.");
  if (profile.role !== "admin_master" && profile.role !== "gestor") throw new Error("Sem permissão para parear telas.");
  const orgId = profile.organization_id;
  const {
    data: pairing,
    error: pairingErr
  } = await supabaseAdmin.from("pairing_codes").select("id, code, used_at, expires_at, screen_id").eq("code", data.code).order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  if (pairingErr) throw new Error(pairingErr.message);
  if (!pairing) throw new Error("Código não encontrado. Verifique se a TV ainda exibe este código.");
  if (pairing.used_at || pairing.screen_id) throw new Error("Este código já foi utilizado.");
  if (pairing.expires_at && new Date(pairing.expires_at).getTime() < Date.now()) throw new Error("Código expirado. Gere um novo na TV.");
  const {
    data: screen,
    error: screenErr
  } = await supabaseAdmin.from("screens").insert({
    organization_id: orgId,
    unit_id: data.unit_id,
    name: data.name,
    orientation: toScreenOrientation(data.orientation),
    pairing_code: data.code,
    device_status: "offline",
    is_online: false
  }).select("id, name").single();
  if (screenErr) throw new Error(screenErr.message);
  const {
    error: updErr
  } = await supabaseAdmin.from("pairing_codes").update({
    used_at: (/* @__PURE__ */ new Date()).toISOString(),
    screen_id: screen.id,
    organization_id: orgId
  }).eq("id", pairing.id);
  if (updErr) {
    await supabaseAdmin.from("screens").delete().eq("id", screen.id);
    throw new Error(updErr.message);
  }
  return {
    ok: true,
    screen_id: screen.id,
    screen_name: screen.name
  };
});
const createPairingCode_createServerFn_handler = createServerRpc({
  id: "6cff29d163aa19012939cdafbf4ae5a0c15e38ce51b0a1b7e53a452a8ea4f2f6",
  name: "createPairingCode",
  filename: "src/lib/server/screens.functions.ts"
}, (opts) => createPairingCode.__executeServer(opts));
const createPairingCode = createServerFn({
  method: "POST"
}).handler(createPairingCode_createServerFn_handler, async () => {
  const hasUrl = Boolean(process.env.SUPABASE_URL ?? "https://auhwylnhqmdgphsvjszr.supabase.co");
  const hasKey = Boolean(process.env.SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log("[createPairingCode] env check:", {
    hasUrl,
    hasKey
  });
  if (!hasUrl || !hasKey) {
    throw new Error(`Configuração do servidor ausente (url=${hasUrl}, serviceKey=${hasKey}). Verifique SERVICE_ROLE_KEY.`);
  }
  const chunk = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  const code = `${chunk()}-${chunk()}`;
  const expires_at = new Date(Date.now() + 10 * 60 * 1e3).toISOString();
  try {
    const {
      data: inserted,
      error
    } = await supabaseAdmin.from("pairing_codes").insert({
      code,
      expires_at
    }).select("id, code, expires_at").single();
    if (error) {
      console.error("[createPairingCode] insert error:", JSON.stringify(error));
      throw new Error(`Falha ao registrar código: ${error.message}`);
    }
    console.log("[createPairingCode] inserted:", inserted?.code);
    return {
      code: inserted?.code ?? code,
      expires_at: inserted?.expires_at ?? expires_at
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[createPairingCode] exception:", msg);
    throw new Error(msg || "Não foi possível registrar o código de pareamento.");
  }
});
const checkPairingStatus_createServerFn_handler = createServerRpc({
  id: "96383b5b3a0713d68ef3a1f7fbf2ba0c052d46053ec2454a49203e0382498ae6",
  name: "checkPairingStatus",
  filename: "src/lib/server/screens.functions.ts"
}, (opts) => checkPairingStatus.__executeServer(opts));
const checkPairingStatus = createServerFn({
  method: "POST"
}).inputValidator((input) => {
  if (typeof input !== "object" || input === null) throw new Error("Payload inválido.");
  const {
    code
  } = input;
  if (typeof code !== "string" || code.trim().length < 4) throw new Error("Código inválido.");
  return {
    code: normalizeCode(code)
  };
}).handler(checkPairingStatus_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      data: pairing,
      error
    } = await supabaseAdmin.from("pairing_codes").select("used_at, screen_id, expires_at").eq("code", data.code).order("created_at", {
      ascending: false
    }).limit(1).maybeSingle();
    if (error) {
      console.error("[checkPairingStatus] supabase error:", error.message);
      return {
        paired: false,
        expired: false,
        found: false
      };
    }
    if (!pairing) return {
      paired: false,
      expired: false,
      found: false
    };
    const expired = pairing.expires_at ? new Date(pairing.expires_at).getTime() < Date.now() : false;
    return {
      paired: Boolean(pairing.used_at && pairing.screen_id),
      expired: expired && !pairing.used_at,
      found: true
    };
  } catch (e) {
    console.error("[checkPairingStatus] exception:", e instanceof Error ? e.message : String(e));
    return {
      paired: false,
      expired: false,
      found: false
    };
  }
});
export {
  checkPairingStatus_createServerFn_handler,
  claimPairingCode_createServerFn_handler,
  createPairingCode_createServerFn_handler
};

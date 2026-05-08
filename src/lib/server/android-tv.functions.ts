import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FALLBACK_SUPABASE_URL = "https://auhwylnhqmdgphsvjszr.supabase.co";
const FALLBACK_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1aHd5bG5ocW1kZ3Boc3Zqc3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTcxNTQsImV4cCI6MjA5MTg3MzE1NH0.NNHIM43GJyOYYSjgZX3F1o5Pk_WrEx8xYzIrZpJt3kw";

function userClient() {
  const auth = getRequestHeader("authorization") ?? "";
  const url =
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;
  const anon =
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    FALLBACK_ANON;
  return createClient(url, anon, {
    global: { headers: auth ? { Authorization: auth } : {} },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const linkAndroidTvDevice = createServerFn({ method: "POST" })
  .inputValidator((d: { pairing_code: string; screen_id: string }) =>
    z
      .object({
        pairing_code: z.string().regex(/^\d{6}$/),
        screen_id: z.string().uuid(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const u = userClient();
    const { data: me } = await u.auth.getUser();
    if (!me?.user) throw new Error("Sem sessão.");

    const { data: screen, error: sErr } = await u
      .from("screens")
      .select("id, organization_id")
      .eq("id", data.screen_id)
      .maybeSingle();
    if (sErr || !screen) throw new Error("Tela não encontrada ou sem permissão.");

    const { data: dev, error: dErr } = await supabaseAdmin
      .from("android_tv_devices")
      .select("id, status")
      .eq("pairing_code", data.pairing_code)
      .maybeSingle();
    if (dErr) throw new Error(dErr.message);
    if (!dev) throw new Error("Código não encontrado. Confira na tela do APK.");
    if (dev.status === "revoked") throw new Error("Dispositivo revogado.");

    const { error: uErr } = await supabaseAdmin
      .from("android_tv_devices")
      .update({
        screen_id: data.screen_id,
        organization_id: screen.organization_id,
        status: "paired",
        paired_at: new Date().toISOString(),
      })
      .eq("id", dev.id);
    if (uErr) throw new Error(uErr.message);

    return { ok: true };
  });

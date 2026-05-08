// Server functions admin para vincular Android TV pelo painel.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const linkAndroidTvDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { pairing_code: string; screen_id: string }) =>
    z
      .object({
        pairing_code: z.string().regex(/^\d{6}$/),
        screen_id: z.string().uuid(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // Confere que a tela pertence à org do usuário (RLS valida).
    const { data: screen, error: sErr } = await supabase
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

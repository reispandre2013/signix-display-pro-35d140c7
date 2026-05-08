import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertCanAddScreen } from "@/lib/server/plan-limits.server";

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

const linkSchema = z
  .object({
    pairing_code: z.string().regex(/^\d{6}$/),
    screen_id: z.string().uuid().optional(),
    new_screen: z
      .object({
        name: z.string().trim().min(2, "Informe um nome para a tela."),
        unit_id: z.string().uuid().nullable().optional(),
        orientation: z.enum(["landscape", "portrait"]).optional(),
      })
      .optional(),
  })
  .refine((d) => Boolean(d.screen_id || d.new_screen), {
    message: "Informe uma tela existente ou os dados para criar uma nova.",
  });

export const linkAndroidTvDevice = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      pairing_code: string;
      screen_id?: string;
      new_screen?: { name: string; unit_id?: string | null; orientation?: "landscape" | "portrait" };
    }) => linkSchema.parse(d),
  )
  .handler(async ({ data }) => {
    const u = userClient();
    const { data: me } = await u.auth.getUser();
    if (!me?.user) throw new Error("Sem sessão.");

    let screenId: string;
    let organizationId: string;

    if (data.screen_id) {
      const { data: screen, error: sErr } = await u
        .from("screens")
        .select("id, organization_id")
        .eq("id", data.screen_id)
        .maybeSingle();
      if (sErr || !screen) throw new Error("Tela não encontrada ou sem permissão.");
      screenId = screen.id as string;
      organizationId = screen.organization_id as string;
    } else if (data.new_screen) {
      // Cria a tela na organização do usuário autenticado.
      const { data: profile, error: pErr } = await supabaseAdmin
        .from("profiles")
        .select("id, role, organization_id")
        .eq("auth_user_id", me.user.id)
        .maybeSingle();
      if (pErr) throw new Error(pErr.message);
      if (!profile?.organization_id) throw new Error("Perfil sem organização.");
      if (
        profile.role !== "admin_master" &&
        profile.role !== "gestor" &&
        profile.role !== "operador"
      ) {
        throw new Error("Sem permissão para criar telas.");
      }
      organizationId = profile.organization_id as string;

      // Bloqueio por plano.
      await assertCanAddScreen(supabaseAdmin, organizationId);

      const orientation = data.new_screen.orientation ?? "landscape";
      const { data: created, error: cErr } = await supabaseAdmin
        .from("screens")
        .insert({
          organization_id: organizationId,
          unit_id: data.new_screen.unit_id ?? null,
          name: data.new_screen.name.trim(),
          orientation: orientation === "portrait" ? "vertical" : "horizontal",
          device_status: "offline",
          is_online: false,
          platform: "android",
          store_type: "android_tv",
        })
        .select("id")
        .single();
      if (cErr) throw new Error(cErr.message);
      screenId = created.id as string;
    } else {
      throw new Error("Informe uma tela existente ou os dados para criar uma nova.");
    }

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
        screen_id: screenId,
        organization_id: organizationId,
        status: "paired",
        paired_at: new Date().toISOString(),
      })
      .eq("id", dev.id);
    if (uErr) throw new Error(uErr.message);

    return { ok: true, screen_id: screenId };
  });

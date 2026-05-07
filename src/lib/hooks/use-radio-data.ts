import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type RadioStreamRow = {
  id: string;
  screen_id: string;
  organization_id: string;
  radio_name: string;
  stream_url: string;
  volume: number;
  is_active: boolean;
  updated_at: string;
};

export type ScreenWithRadio = {
  screen_id: string;
  screen_name: string;
  device_id: string | null;
  device_name: string | null;
  pairing_status: string | null;
  organization_id: string;
  organization_name: string | null;
  radio: RadioStreamRow | null;
};

/**
 * Lista telas + dispositivo pareado + rádio.
 * Usa o mesmo padrão do useScreens (client direto + RLS) que já funciona.
 * Não depende de server function (que estava retornando vazio por causa do
 * header Authorization não chegar corretamente).
 */
export function useScreensWithRadio() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? null;
  const isSuperAdmin = profile?.role === "super_admin";

  return useQuery({
    queryKey: ["radio-screens", orgId, isSuperAdmin],
    enabled: isSuperAdmin || !!orgId,
    refetchInterval: 20_000,
    queryFn: async (): Promise<ScreenWithRadio[]> => {
      // 1) Telas (RLS aplica) — exatamente como useScreens
      let sQ = supabase
        .from("screens")
        .select("id, name, organization_id")
        .order("name", { ascending: true });
      if (!isSuperAdmin && orgId) sQ = sQ.eq("organization_id", orgId);
      const { data: screens, error: sErr } = await sQ;
      if (sErr) throw sErr;
      const screenList = (screens ?? []) as Array<{
        id: string;
        name: string;
        organization_id: string;
      }>;
      if (screenList.length === 0) return [];

      const screenIds = screenList.map((s) => s.id);

      // 2) Dispositivos pareados (opcional — só p/ enriquecer UI)
      const { data: devices } = await supabase
        .from("player_devices")
        .select("id, screen_id, device_name, pairing_status")
        .in("screen_id", screenIds);

      const deviceByScreen = new Map<
        string,
        { id: string; device_name: string | null; pairing_status: string | null }
      >();
      for (const d of (devices ?? []) as Array<{
        id: string;
        screen_id: string;
        device_name: string | null;
        pairing_status: string | null;
      }>) {
        const prev = deviceByScreen.get(d.screen_id);
        if (!prev || (d.pairing_status === "active" && prev.pairing_status !== "active")) {
          deviceByScreen.set(d.screen_id, {
            id: d.id,
            device_name: d.device_name,
            pairing_status: d.pairing_status,
          });
        }
      }

      // 3) Organizações (para mostrar nome)
      const orgIds = Array.from(new Set(screenList.map((s) => s.organization_id).filter(Boolean)));
      const orgNameById = new Map<string, string>();
      if (orgIds.length > 0) {
        const { data: orgs } = await supabase
          .from("organizations")
          .select("id, name")
          .in("id", orgIds);
        for (const o of (orgs ?? []) as Array<{ id: string; name: string | null }>) {
          orgNameById.set(o.id, o.name ?? "");
        }
      }

      // 4) Rádios já configuradas
      const { data: radios } = await supabase
        .from("radio_streams")
        .select("*")
        .in("screen_id", screenIds);
      const radioByScreen = new Map<string, RadioStreamRow>();
      for (const r of (radios ?? []) as RadioStreamRow[]) radioByScreen.set(r.screen_id, r);

      return screenList.map((s) => {
        const dev = deviceByScreen.get(s.id) ?? null;
        return {
          screen_id: s.id,
          screen_name: s.name,
          device_id: dev?.id ?? null,
          device_name: dev?.device_name ?? null,
          pairing_status: dev?.pairing_status ?? null,
          organization_id: s.organization_id,
          organization_name: orgNameById.get(s.organization_id) ?? null,
          radio: radioByScreen.get(s.id) ?? null,
        };
      });
    },
  });
}

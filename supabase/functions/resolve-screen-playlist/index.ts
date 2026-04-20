import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { readJson } from "../_shared/http.ts";

type ResolvePayload = {
  screenId?: string | null;
  screen_id?: string | null;
};

const corsJsonHeaders: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsJsonHeaders });
}

function normalizeScreenId(raw: string | null | undefined): string {
  return String(raw ?? "").trim();
}

type ResolveResult = {
  success: boolean;
  playlist: unknown[];
  screen: unknown | null;
  message: string;
  payload: unknown;
};

async function resolvePlaylistByScreenId(screenId: string): Promise<ResolveResult> {
  // Estrutura pronta para evolução: manter este ponto central para a futura lógica
  // de busca/normalização de playlist por screen_id.
  if (!screenId) {
    return {
      success: true,
      playlist: [],
      screen: null,
      message: "Playlist carregada",
      // Compatibilidade com o frontend atual (player espera `payload`).
      payload: null,
    };
  }

  const { data, error } = await adminClient.rpc("resolve_screen_payload", {
    p_screen_id: screenId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const playlist = Array.isArray((data as { items?: unknown[] } | null)?.items)
    ? (((data as { items?: unknown[] }).items ?? []) as unknown[])
    : [];

  return {
    success: true,
    playlist,
    screen: null,
    message: "Playlist carregada",
    // Mantém contrato existente usado pelo player atual.
    payload: data ?? null,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson<ResolvePayload>(req).catch(() => ({} as ResolvePayload));
    const screenId = normalizeScreenId(body.screenId ?? body.screen_id ?? null);
    const result = await resolvePlaylistByScreenId(screenId);
    return jsonResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

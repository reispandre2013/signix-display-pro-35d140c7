import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { readJson } from "../_shared/http.ts";

const cors: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const url = Deno.env.get("SUPABASE_URL") ?? "";
const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

type Body = { kind?: string; by?: number };

/** Invoca `check_plan_limit` no Postgres; falha com erro amigável se exceder. */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });
  }
  if (!url || !anon) {
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), { status: 500, headers: cors });
  }
  const auth = req.headers.get("Authorization");
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: cors });
  }
  const body = await readJson<Body>(req);
  const kind = String(body.kind ?? "screen");
  const by = typeof body.by === "number" ? body.by : 1;

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401, headers: cors });
  }
  const { data: prof } = await supabase.from("profiles").select("organization_id").eq("auth_user_id", userData.user.id).maybeSingle();
  const orgId = prof?.organization_id as string | undefined;
  if (!orgId) {
    return new Response(JSON.stringify({ error: "No organization" }), { status: 400, headers: cors });
  }

  const { error } = await supabase.rpc("check_plan_limit", { p_org: orgId, p_kind: kind, p_by: by });
  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 400, headers: cors });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
});

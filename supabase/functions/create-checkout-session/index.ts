import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { adminClient } from "../_shared/client.ts";
import { readJson } from "../_shared/http.ts";

const cors: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Body = {
  plan_id?: string;
  buyer_email?: string;
  company_name?: string;
};

/**
 * Cria `checkout_sessions` (stub). A URL real de pagamento preenche-se quando
 * o adaptador (Stripe, Mercado Pago, etc.) for configurado.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });
  }

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!url || !anon) {
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), { status: 500, headers: cors });
  }
  const auth = req.headers.get("Authorization");
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: cors });
  }
  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401, headers: cors });
  }

  const body = await readJson<Body>(req);
  if (!body.plan_id) {
    return new Response(JSON.stringify({ error: "plan_id required" }), { status: 400, headers: cors });
  }

  const { data: row, error } = await adminClient
    .from("checkout_sessions")
    .insert({
      plan_id: body.plan_id,
      buyer_email: body.buyer_email ?? u.user.email,
      company_name: body.company_name,
      status: "pending",
      payment_provider: "stub",
    })
    .select("id")
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
  }

  return new Response(
    JSON.stringify({
      id: row?.id,
      checkout_url: null,
      message: "Stub: configure o adaptador de pagamento (Stripe, Mercado Pago, etc.) e checkout_url no provider.",
    }),
    { status: 200, headers: cors },
  );
});

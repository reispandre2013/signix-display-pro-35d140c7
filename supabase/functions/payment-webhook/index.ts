import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/client.ts";
import { reaisToCents } from "../_shared/asaas.ts";

const cors: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, asaas-access-token, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type AsaasPay = {
  id?: string;
  object?: string;
  value?: number;
  netValue?: number;
  status?: string;
  billingType?: string;
  subscription?: string | null;
  customer?: string;
  description?: string;
  externalReference?: string | null;
  dateCreated?: string;
  confirmedDate?: string;
  dueDate?: string | null;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  paymentDate?: string | null;
  creditDate?: string | null;
};

type AsaasWebhookBody = { id?: string; event?: string; payment?: AsaasPay };

function addPeriodEnd(isoStart: string, cycle: "monthly" | "yearly"): string {
  const d = new Date(isoStart);
  if (cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

function asaasInvoiceStatus(
  event: string,
  pay: AsaasPay,
): "draft" | "open" | "paid" | "overdue" | "void" | "refunded" {
  if (event === "PAYMENT_REFUNDED" || pay.status === "REFUNDED" || pay.status === "CHARGEBACK")
    return "refunded";
  if (event === "PAYMENT_DELETED") return "void";
  if (event === "PAYMENT_OVERDUE" || pay.status === "OVERDUE") return "overdue";
  if (
    event === "PAYMENT_RECEIVED" ||
    pay.status === "RECEIVED" ||
    event === "PAYMENT_CONFIRMED" ||
    pay.status === "CONFIRMED"
  ) {
    return "paid";
  }
  return "open";
}

function parseAsaasDate(s: string | null | undefined): string | null {
  if (s == null || s === "") return null;
  const t = new Date(s);
  return isNaN(t.getTime()) ? null : t.toISOString();
}

/**
 * Cria fatura em `invoices` espelhando o `pay_` do Asaas; idempotente por external_id + asaas.
 */
async function ensureAsaasInvoiceLinkPayment(opts: {
  orgId: string;
  ourSubscriptionId: string | null;
  pay: AsaasPay;
  payId: string;
  valueCents: number;
  event: string;
  paymentRowId: string;
}): Promise<string | null> {
  const { data: iex } = await adminClient
    .from("invoices")
    .select("id")
    .eq("external_provider", "asaas")
    .eq("external_id", opts.payId)
    .maybeSingle();
  if (iex) {
    const invId = (iex as { id: string }).id;
    if (opts.ourSubscriptionId) {
      await adminClient
        .from("invoices")
        .update({ subscription_id: opts.ourSubscriptionId, updated_at: new Date().toISOString() })
        .eq("id", invId);
    }
    await adminClient.from("payments").update({ invoice_id: invId }).eq("id", opts.paymentRowId);
    return invId;
  }

  const st = asaasInvoiceStatus(opts.event, opts.pay);
  const methodLabel = (opts.pay.billingType ?? "outro").toLowerCase();
  const docUrl = opts.pay.invoiceUrl ?? opts.pay.bankSlipUrl ?? null;
  const dueAt = parseAsaasDate(opts.pay.dueDate);
  const paidAt =
    st === "paid"
      ? (parseAsaasDate(opts.pay.confirmedDate) ??
        parseAsaasDate(opts.pay.paymentDate) ??
        parseAsaasDate(opts.pay.creditDate) ??
        new Date().toISOString())
      : null;

  const { data: inv, error: invErr } = await adminClient
    .from("invoices")
    .insert({
      organization_id: opts.orgId,
      subscription_id: opts.ourSubscriptionId,
      number: `ASAAS-${opts.payId}`,
      amount_cents: opts.valueCents,
      currency: "BRL",
      status: st,
      due_date: dueAt,
      paid_at: paidAt,
      issued_at: parseAsaasDate(opts.pay.dateCreated) ?? new Date().toISOString(),
      payment_method: methodLabel,
      payment_provider: "asaas",
      external_provider: "asaas",
      external_id: opts.payId,
      pdf_url: docUrl,
      invoice_url: opts.pay.invoiceUrl ?? null,
    })
    .select("id")
    .single();

  if (invErr) {
    console.error("[payment-webhook] invoice insert", invErr);
    return null;
  }
  const invId = (inv as { id: string }).id;
  const { error: pUp } = await adminClient
    .from("payments")
    .update({ invoice_id: invId })
    .eq("id", opts.paymentRowId);
  if (pUp) console.error("[payment-webhook] payment link invoice", pUp);
  return invId;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: cors,
    });
  }

  const rawBody = await req.text();
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody || "{}") as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: cors,
    });
  }

  const asaasToken = Deno.env.get("ASAAS_WEBHOOK_TOKEN")?.trim();
  const incomingAsaas = req.headers.get("asaas-access-token")?.trim();
  if (asaasToken && asaasToken.length > 0) {
    if (incomingAsaas !== asaasToken) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid asaas-access-token" }), {
        status: 401,
        headers: cors,
      });
    }
  }

  const asaas = payload as AsaasWebhookBody;
  if (asaas.event && asaas.payment?.id) {
    return handleAsaasPayload(asaas, rawBody);
  }

  const secret = Deno.env.get("PAYMENT_WEBHOOK_SECRET");
  const incoming = req.headers.get("x-webhook-secret");
  if (secret && incoming !== secret) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid secret" }), {
      status: 401,
      headers: cors,
    });
  }

  const orgId = typeof payload.organization_id === "string" ? payload.organization_id : null;
  if (!orgId) {
    return new Response(
      JSON.stringify({ ok: false, error: "organization_id required in payload for stub" }),
      { status: 400, headers: cors },
    );
  }

  const amount = typeof payload.amount_cents === "number" ? payload.amount_cents : 0;
  const status = String(payload.status ?? "pending");
  const extId = String(payload.external_payment_id ?? `stub-${Date.now()}`);

  const { error } = await adminClient.from("payments").insert({
    organization_id: orgId,
    amount_cents: amount,
    status,
    payment_provider: String(payload.provider ?? "stub"),
    external_payment_id: extId,
    paid_at: status === "paid" || status === "succeeded" ? new Date().toISOString() : null,
    raw_payload: payload,
  });

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: cors,
    });
  }

  return new Response(JSON.stringify({ ok: true, received: true, mode: "stub" }), {
    status: 200,
    headers: cors,
  });
});

async function handleAsaasPayload(asaas: AsaasWebhookBody, rawForDb: string): Promise<Response> {
  const p = asaas.payment as AsaasPay;
  const payId = p.id;
  if (!payId) {
    return new Response(JSON.stringify({ ok: true, skip: "no pay id" }), {
      status: 200,
      headers: cors,
    });
  }

  const event = asaas.event ?? "";
  if (
    ![
      "PAYMENT_RECEIVED",
      "PAYMENT_CONFIRMED",
      "PAYMENT_OVERDUE",
      "PAYMENT_REFUNDED",
      "PAYMENT_DELETED",
      "PAYMENT_CREATED",
    ].includes(event)
  ) {
    return new Response(JSON.stringify({ ok: true, ignored: event }), {
      status: 200,
      headers: cors,
    });
  }
  if (event === "PAYMENT_CREATED") {
    return new Response(JSON.stringify({ ok: true, skip: "PAYMENT_CREATED" }), {
      status: 200,
      headers: cors,
    });
  }

  const { data: existing } = await adminClient
    .from("payments")
    .select("id, invoice_id, subscription_id")
    .eq("external_payment_id", payId)
    .eq("payment_provider", "asaas")
    .maybeSingle();

  const asaasSubId = p.subscription ?? null;
  if (!asaasSubId) {
    return new Response(JSON.stringify({ ok: true, skip: "no subscription on payment" }), {
      status: 200,
      headers: cors,
    });
  }

  const { data: row, error: csErr } = await adminClient
    .from("checkout_sessions")
    .select("id, organization_id, plan_id, status, external_checkout_id, billing_cycle")
    .eq("external_checkout_id", asaasSubId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (csErr) {
    return new Response(JSON.stringify({ ok: false, error: csErr.message }), {
      status: 500,
      headers: cors,
    });
  }
  if (!row?.organization_id) {
    return new Response(
      JSON.stringify({
        ok: true,
        message: "checkout_session not found for subscription " + asaasSubId,
      }),
      { status: 200, headers: cors },
    );
  }

  const orgId = row.organization_id as string;
  const planId = row.plan_id as string;
  const valueCents = p.value != null ? reaisToCents(Number(p.value)) : 0;
  const payStatus =
    event === "PAYMENT_REFUNDED"
      ? "failed"
      : event === "PAYMENT_OVERDUE" || event === "PAYMENT_DELETED"
        ? "pending"
        : "paid";

  const { data: ourSub } = await adminClient
    .from("subscriptions")
    .select("id")
    .eq("external_subscription_id", asaasSubId)
    .maybeSingle();
  const ourSubId: string | null = ourSub ? (ourSub as { id: string }).id : null;

  let paymentRowId: string;
  if (!existing) {
    const { error: payErr, data: ins } = await adminClient
      .from("payments")
      .insert({
        organization_id: orgId,
        subscription_id: ourSubId,
        amount_cents: valueCents,
        status: payStatus,
        method: p.billingType?.toLowerCase() ?? "unknown",
        payment_provider: "asaas",
        external_payment_id: payId,
        paid_at:
          event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED"
            ? (p.confirmedDate ?? p.dateCreated ?? new Date().toISOString())
            : null,
        raw_payload: { source: "asaas", event, body: asaas, raw: rawForDb } as never,
      })
      .select("id")
      .single();
    if (payErr || !ins) {
      return new Response(
        JSON.stringify({ ok: false, error: payErr?.message ?? "insert payment" }),
        { status: 500, headers: cors },
      );
    }
    paymentRowId = (ins as { id: string }).id;
  } else {
    paymentRowId = (existing as { id: string }).id;
    if (ourSubId && !(existing as { subscription_id?: string }).subscription_id) {
      await adminClient
        .from("payments")
        .update({ subscription_id: ourSubId })
        .eq("id", paymentRowId);
    }
  }

  if (!(existing as { invoice_id?: string } | null)?.invoice_id) {
    await ensureAsaasInvoiceLinkPayment({
      orgId,
      ourSubscriptionId: ourSubId,
      pay: p,
      payId,
      valueCents,
      event,
      paymentRowId,
    });
  }

  const shouldProvision =
    !ourSub &&
    (event === "PAYMENT_RECEIVED" ||
      (event === "PAYMENT_CONFIRMED" && p.billingType === "CREDIT_CARD"));

  if (shouldProvision) {
    const { data: plan } = await adminClient
      .from("plans")
      .select(
        "id, name, max_screens, max_users, max_storage_mb, price_monthly_cents, price_yearly_cents",
      )
      .eq("id", planId)
      .maybeSingle();
    if (plan) {
      const isYearly = (row as { billing_cycle?: string }).billing_cycle === "yearly";
      const pl = plan as {
        max_screens: number;
        max_users: number;
        max_storage_mb?: number;
        price_monthly_cents?: number;
        price_yearly_cents?: number;
      };
      const amountLine = isYearly ? (pl.price_yearly_cents ?? 0) : (pl.price_monthly_cents ?? 0);

      await adminClient
        .from("subscriptions")
        .update({ status: "canceled", canceled_at: new Date().toISOString() })
        .eq("organization_id", orgId)
        .in("status", ["active", "trialing", "past_due"]);

      const start = new Date().toISOString();
      const { error: subErr, data: subNew } = await adminClient
        .from("subscriptions")
        .insert({
          organization_id: orgId,
          plan_id: planId,
          status: "active",
          billing_cycle: isYearly ? "yearly" : "monthly",
          current_period_start: start,
          current_period_end: addPeriodEnd(start, isYearly ? "yearly" : "monthly"),
          amount_cents: amountLine,
          payment_provider: "asaas",
          external_provider: "asaas",
          external_subscription_id: asaasSubId,
        })
        .select("id")
        .single();
      if (subErr) {
        console.error("[payment-webhook] subscription insert", subErr);
      } else if (subNew) {
        const newSid = (subNew as { id: string }).id;
        await adminClient
          .from("licenses")
          .update({ status: "canceled" })
          .eq("organization_id", orgId)
          .eq("status", "active");
        await adminClient.from("licenses").insert({
          organization_id: orgId,
          subscription_id: newSid,
          plan_id: planId,
          status: "active",
          max_screens: pl.max_screens,
          max_users: pl.max_users,
          max_storage_mb: pl.max_storage_mb ?? 5120,
        });
        await adminClient
          .from("checkout_sessions")
          .update({ status: "succeeded", updated_at: new Date().toISOString() })
          .eq("id", row.id);
        await adminClient
          .from("payments")
          .update({ subscription_id: newSid })
          .eq("id", paymentRowId);
        await adminClient
          .from("invoices")
          .update({ subscription_id: newSid })
          .eq("external_id", payId)
          .eq("external_provider", "asaas");
      }
    }
  }

  return new Response(
    JSON.stringify({ ok: true, asaas: true, event, payment: payId, invoice: "synced" }),
    { status: 200, headers: cors },
  );
}

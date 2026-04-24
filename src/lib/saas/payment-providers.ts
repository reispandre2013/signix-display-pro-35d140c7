/**
 * Asaas: credenciais e webhook estão em `supabase/functions` (create-checkout + payment-webhook) e `docs/integrations/asaas.md`.
 * O webhook despoleta o fluxo e grava `payments.raw_payload` em Postgres; stub legado ainda suporta `PAYMENT_WEBHOOK_SECRET`.
 */
export type PaymentProviderName = "stripe" | "mercado_pago" | "asaas" | "infinitepay" | "custom";

export type NormalizedPaymentEvent = {
  provider: PaymentProviderName;
  type: "payment_succeeded" | "payment_failed" | "subscription_updated" | "unknown";
  externalPaymentId: string;
  amountCents?: number;
  currency?: string;
  referenceId: string;
  raw: Record<string, unknown>;
};

export interface PaymentProviderAdapter {
  name: PaymentProviderName;
  verifyRequest(req: Request, rawBody: string): boolean;
  parseEvent(req: Request, rawBody: string): NormalizedPaymentEvent | null;
}

export const stubAdapter: PaymentProviderAdapter = {
  name: "custom",
  verifyRequest: () => true,
  parseEvent: (_req, rawBody) => {
    try {
      const raw = JSON.parse(rawBody) as Record<string, unknown>;
      return {
        provider: "custom",
        type: (raw.type as NormalizedPaymentEvent["type"]) ?? "unknown",
        externalPaymentId: String(raw.id ?? "stub"),
        referenceId: String(raw.referenceId ?? raw.checkoutId ?? ""),
        raw,
      };
    } catch {
      return null;
    }
  },
};

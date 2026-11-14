/** Extraction pure des informations utiles d'un événement Stripe (testable sans réseau ni base). */
import type Stripe from "stripe";

export type PaymentAction =
  | { kind: "rental"; reservationId: string; paymentIntentId: string; amountCents: number; customerId: string | null }
  | { kind: "deposit"; reservationId: string; paymentIntentId: string; amountCents: number; customerId: null };

export type AccountAction = { kind: "account"; accountId: string; payoutsEnabled: boolean; detailsSubmitted: boolean };

export function extractAction(event: Stripe.Event): PaymentAction | AccountAction | null {
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      // La location est prélevée tout de suite : on n'agit que si Stripe confirme « paid ».
      if (s.metadata?.kind !== "rental" || s.payment_status !== "paid") return null;
      const pi = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
      if (!pi || !s.metadata.reservation_id || typeof s.amount_total !== "number") return null;
      const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id ?? null;
      return { kind: "rental", reservationId: s.metadata.reservation_id, paymentIntentId: pi, amountCents: s.amount_total, customerId };
    }
    case "payment_intent.amount_capturable_updated": {
      const pi = event.data.object as Stripe.PaymentIntent;
      if (pi.metadata?.kind !== "deposit" || !pi.metadata.reservation_id) return null;
      if (pi.status !== "requires_capture") return null;
      return { kind: "deposit", reservationId: pi.metadata.reservation_id, paymentIntentId: pi.id, amountCents: pi.amount_capturable, customerId: null };
    }
    case "account.updated": {
      const a = event.data.object as Stripe.Account;
      return { kind: "account", accountId: a.id, payoutsEnabled: !!a.payouts_enabled, detailsSubmitted: !!a.details_submitted };
    }
    default:
      return null;
  }
}

import "server-only";
import type Stripe from "stripe";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { extractAction } from "./events";
import { getStripe } from "./client";
import { notify } from "@/lib/email/notify";

/** Termine les actions Stripe en attente pour un PaymentIntent (remboursement ou libération d'empreinte). Rejouable. */
async function finishPending(paymentIntentId: string) {
  const db = createSupabaseServiceClient();
  const stripe = getStripe();
  const { data: p } = await db.from("payments").select("id, status").eq("stripe_payment_intent_id", paymentIntentId).maybeSingle();
  if (!p) return;
  if (p.status === "refund_needed") {
    await stripe.refunds.create({ payment_intent: paymentIntentId }, { idempotencyKey: `refund-${p.id}` });
    await db.from("payments").update({ status: "refunded", updated_at: new Date().toISOString() }).eq("id", p.id);
  } else if (p.status === "cancel_deposit") {
    try {
      await stripe.paymentIntents.cancel(paymentIntentId, undefined, { idempotencyKey: `release-${p.id}` });
    } catch (e) {
      // Déjà annulée ou expirée côté Stripe : l'empreinte n'existe plus, c'est le résultat voulu.
      if (!(e instanceof Error) || !/canceled|cancelled|expired/i.test(e.message)) throw e;
    }
    await db.from("payments").update({ status: "released", updated_at: new Date().toISOString() }).eq("id", p.id);
  }
}

export async function handleStripeEvent(event: Stripe.Event): Promise<string> {
  const action = extractAction(event);
  if (!action) return "ignored";
  const db = createSupabaseServiceClient();

  if (action.kind === "account") {
    await db.from("accommodations").update({
      stripe_payouts_enabled: action.payoutsEnabled, stripe_details_submitted: action.detailsSubmitted,
    }).eq("stripe_account_id", action.accountId);
    return "applied";
  }

  const { data, error } = await db.rpc("apply_stripe_payment_event", {
    p_event_id: event.id, p_kind: action.kind, p_reservation: action.reservationId,
    p_pi: action.paymentIntentId, p_amount: action.amountCents, p_customer: action.customerId,
  });
  if (error) throw new Error(`apply_stripe_payment_event: ${error.message}`);

  // Sur « duplicate » aussi : si un envoi précédent a échoué après la base, on réessaie l'action Stripe.
  if (data === "refund_needed" || data === "cancel_deposit" || data === "duplicate") await finishPending(action.paymentIntentId);
  if (data === "refund_needed" || data === "cancel_deposit") {
    await db.from("audit_logs").insert({
      action: `stripe.${data}`, entity: "reservation", entity_id: action.reservationId,
      details: { payment_intent: action.paymentIntentId, event: event.id },
    });
  }
  if (data === "applied" && action.kind === "rental") {
    try { await notify(action.reservationId, "confirmation"); } catch (e) { console.error("email confirmation", e instanceof Error ? e.message : e); }
  }
  return data as string;
}

import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { commissionCents } from "@/lib/pricing";
import { getStripe } from "./client";

export type CommissionResult = "transferred" | "already" | "zero" | "no_account" | "not_completed" | "no_payment";

/** Verse la commission de l'hébergeur (charges et transferts séparés), une fois la location terminée. Rejouable. */
export async function payCommission(reservationId: string): Promise<CommissionResult> {
  const db = createSupabaseServiceClient();
  const { data: r } = await db.from("reservations")
    .select("id, number, status, total_cents, accommodations(stripe_account_id, stripe_payouts_enabled, commission_bps)")
    .eq("id", reservationId).maybeSingle();
  if (!r || r.status !== "completed") return "not_completed";

  const { data: existing } = await db.from("commission_transfers").select("reservation_id").eq("reservation_id", reservationId).maybeSingle();
  if (existing) return "already";

  const acc = r.accommodations as unknown as { stripe_account_id: string | null; stripe_payouts_enabled: boolean; commission_bps: number };
  const amount = commissionCents(r.total_cents, acc.commission_bps);
  if (amount === 0) return "zero";
  if (!acc.stripe_account_id || !acc.stripe_payouts_enabled) return "no_account";

  const { data: pay } = await db.from("payments").select("stripe_payment_intent_id").eq("reservation_id", reservationId).eq("kind", "rental").eq("status", "succeeded").maybeSingle();
  if (!pay) return "no_payment"; // réservation de démonstration ou paiement remboursé

  const stripe = getStripe();
  const pi = await stripe.paymentIntents.retrieve(pay.stripe_payment_intent_id);
  const charge = typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id;
  if (!charge) return "no_payment";

  const transfer = await stripe.transfers.create({
    amount, currency: "eur", destination: acc.stripe_account_id,
    transfer_group: r.number, source_transaction: charge,
    metadata: { reservation_id: r.id },
  }, { idempotencyKey: `commission-${r.id}` });

  await db.from("commission_transfers").upsert({ reservation_id: r.id, stripe_transfer_id: transfer.id, amount_cents: amount });
  await db.from("audit_logs").insert({ action: "commission.transferred", entity: "reservation", entity_id: r.id, details: { transfer: transfer.id, amount_cents: amount } });
  return "transferred";
}

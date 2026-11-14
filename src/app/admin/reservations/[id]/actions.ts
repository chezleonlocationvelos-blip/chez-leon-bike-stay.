"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { depositOutcome } from "@/lib/stripe/deposit";
import { payCommission } from "@/lib/stripe/commission";

const schema = z.object({
  id: z.string().uuid(),
  damage_eur: z.coerce.number().min(0).max(100000),
  notes: z.string().trim().max(2000).optional(),
});

/** Clôture la location : règle la caution (Stripe d'abord, base ensuite), met les vélos en contrôle, verse la commission. */
export async function closeRental(formData: FormData) {
  const { userId } = await requireRole("admin");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  const id = String(formData.get("id") ?? "");
  const back = (m: string) => redirect(`/admin/reservations/${id}?msg=${m}`);
  if (!parsed.success) return back("invalid");

  const damageCents = Math.round(parsed.data.damage_eur * 100);
  const notes = parsed.data.notes || null;
  if (damageCents > 0 && (notes?.length ?? 0) < 10) return back("notes_required"); // un dommage doit être justifié

  const db = createSupabaseServiceClient();
  const { data: r } = await db.from("reservations").select("id, status, deposit_status, deposit_amount_cents").eq("id", parsed.data.id).maybeSingle();
  if (!r) return back("not_found");
  if (r.status === "completed") return back("already");

  let outcome;
  try { outcome = depositOutcome(damageCents, r.deposit_amount_cents); } catch { return back("amount"); }

  // 1) Stripe : uniquement si une empreinte a réellement été autorisée.
  if (r.deposit_status === "authorized") {
    const { data: dep } = await db.from("payments").select("stripe_payment_intent_id").eq("reservation_id", r.id).eq("kind", "deposit").eq("status", "authorized").maybeSingle();
    if (!dep) return back("no_deposit_payment");
    if (!isStripeConfigured()) return back("stripe_missing");
    const stripe = getStripe();
    try {
      if (outcome.action === "release") {
        await stripe.paymentIntents.cancel(dep.stripe_payment_intent_id, undefined, { idempotencyKey: `dep-release-${r.id}` });
      } else {
        await stripe.paymentIntents.capture(dep.stripe_payment_intent_id, { amount_to_capture: outcome.amountCents }, { idempotencyKey: `dep-capture-${r.id}-${outcome.amountCents}` });
      }
    } catch (e) {
      await db.from("audit_logs").insert({ actor_id: userId, action: "deposit.settle_failed", entity: "reservation", entity_id: r.id, details: { error: e instanceof Error ? e.message : "?" } });
      return back("stripe_failed"); // rien n'est modifié en base : on peut réessayer
    }
  }

  // 2) Base de données
  const { data: result, error } = await db.rpc("record_return", { p_reservation: r.id, p_damage_cents: damageCents, p_notes: notes, p_actor: userId });
  if (error || result !== "applied") return back(result === "already" ? "already" : "db_failed");

  // 3) Commission (échec non bloquant : réessayable depuis la fiche)
  try { await payCommission(r.id); } catch (e) {
    await db.from("audit_logs").insert({ actor_id: userId, action: "commission.failed", entity: "reservation", entity_id: r.id, details: { error: e instanceof Error ? e.message : "?" } });
  }
  revalidatePath(`/admin/reservations/${id}`);
  return back("closed");
}

export async function retryCommission(id: string) {
  await requireRole("admin");
  let msg = "commission_failed";
  try {
    const res = await payCommission(id);
    msg = res === "transferred" || res === "already" ? "commission_ok" : `commission_${res}`;
  } catch { /* message par défaut */ }
  revalidatePath(`/admin/reservations/${id}`);
  redirect(`/admin/reservations/${id}?msg=${msg}`);
}

"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/reservations/token";
import { MockLockProvider } from "@/lib/locks/mock";
import { isStripeConfigured } from "@/lib/stripe/client";
import { notify, notifyOwnerReturn } from "@/lib/email/notify";
import { createDepositCheckout, createRentalCheckout } from "@/lib/stripe/checkout";

/** DÉMONSTRATION UNIQUEMENT : simule paiement, caution et code. Désactivé hors mode démo. */
export async function simulateDemoPayment(token: string) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") redirect(`/r/${token}`);
  const db = createSupabaseServiceClient();
  await db.rpc("release_expired_holds");

  const { data: r } = await db.from("reservations").select("id, status, start_at, end_at, is_demo").eq("access_token_hash", hashToken(token)).maybeSingle();
  if (!r || !r.is_demo) redirect(`/r/${token}`);
  if (r.status !== "pending_payment") redirect(`/r/${token}`);

  const grant = await new MockLockProvider().createGrant({ validFrom: new Date(r.start_at), validUntil: new Date(r.end_at) });
  await db.from("access_grants").upsert({
    reservation_id: r.id, provider: "mock", simulated: true, code: grant.code!,
    valid_from: r.start_at, valid_until: r.end_at,
  });
  await db.from("reservations").update({
    status: "ready", payment_status: "succeeded", deposit_status: "authorized", access_status: "generated",
  }).eq("id", r.id);
  await db.from("availability_holds").delete().eq("reservation_id", r.id);
  await db.from("audit_logs").insert({ action: "demo.payment_simulated", entity: "reservation", entity_id: r.id, details: { simulated: true } });

  try { await notify(r.id, "confirmation"); } catch { /* l'email ne doit jamais bloquer la démo */ }
  revalidatePath(`/r/${token}`);
  redirect(`/r/${token}`);
}

/** Paiement réel de la location : redirige vers Stripe Checkout. Jamais en mode démonstration. */
export async function startRentalPayment(token: string) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !isStripeConfigured()) redirect(`/r/${token}`);
  await createSupabaseServiceClient().rpc("release_expired_holds");
  const res = await createRentalCheckout(token, hashToken(token));
  redirect(res.ok ? res.url : `/r/${token}?error=${res.error.toLowerCase()}`);
}

/** Autorisation de la caution (empreinte bancaire) dans les 24 h avant le retrait. */
export async function startDepositAuthorization(token: string) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !isStripeConfigured()) redirect(`/r/${token}`);
  const res = await createDepositCheckout(token, hashToken(token));
  redirect(res.ok ? res.url : `/r/${token}?error=${res.error.toLowerCase()}`);
}

/** Déclare la restitution : une photo par vélo + une photo de la boîte à clés + attestation cochée. Alerte le gérant. */
export async function declareReturn(token: string, formData: FormData) {
  const db = createSupabaseServiceClient();
  const { data: r } = await db.from("reservations").select("id, status, accommodations(mode)").eq("access_token_hash", hashToken(token)).maybeSingle();
  if (!r || !["confirmed", "ready", "in_progress"].includes(r.status)) redirect(`/r/${token}`);
  // Boutique : le retour se fait au comptoir, pas de déclaration en ligne.
  if ((r.accommodations as unknown as { mode: string } | null)?.mode === "counter") redirect(`/r/${token}`);
  if (formData.get("attest") !== "on") redirect(`/r/${token}?error=attest`);
  const [{ count: bikePhotos }, { count: keyPhotos }, { count: bikes }] = await Promise.all([
    db.from("reservation_return_photos").select("id", { count: "exact", head: true }).eq("reservation_id", r.id).eq("kind", "bike"),
    db.from("reservation_return_photos").select("id", { count: "exact", head: true }).eq("reservation_id", r.id).eq("kind", "keybox"),
    db.from("reservation_bike_assignments").select("id", { count: "exact", head: true }).eq("reservation_id", r.id).eq("active", true),
  ]);
  if ((bikePhotos ?? 0) < Math.max(1, bikes ?? 1) || (keyPhotos ?? 0) < 1) redirect(`/r/${token}?error=photos`);
  await db.from("reservations").update({ status: "return_declared", return_attested_at: new Date().toISOString() }).eq("id", r.id);
  await db.from("audit_logs").insert({ action: "reservation.return_declared_by_customer", entity: "reservation", entity_id: r.id, details: { bike_photos: bikePhotos, keybox_photos: keyPhotos, attested: true } });
  try { await notifyOwnerReturn(r.id); } catch (e) { console.error("Alerte retour non envoyée", e); }
  revalidatePath(`/r/${token}`);
  redirect(`/r/${token}?retour=1`);
}

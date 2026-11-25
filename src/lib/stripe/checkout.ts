import { bikeLineLabel } from "@/lib/labels";
import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { appUrl, getStripe } from "./client";

const DEPOSIT_WINDOW_MS = 24 * 3600 * 1000; // la caution s'autorise dans les 24 h avant le retrait
const EXTENDED_AUTH_FROM_DAYS = 4;          // au-delà, on demande l'autorisation étendue si la carte le permet

export type CheckoutResult = { ok: true; url: string } | { ok: false; error: "NOT_FOUND" | "NOT_PAYABLE" | "TOO_EARLY" | "TOTAL_MISMATCH" };

type Items = { quantity: number; unit_price_cents: number; frame_size: string | null; bike_types: { label: string } }[];
type Accs = { quantity: number; unit_price_cents: number; accessories: { label: string } }[];

async function loadReservation(tokenHash: string) {
  const db = createSupabaseServiceClient();
  const { data } = await db.from("reservations")
    .select(`id, number, status, payment_status, deposit_status, start_at, end_at, billed_days, total_cents, deposit_amount_cents, stripe_customer_id,
             customers(email), reservation_items(quantity, unit_price_cents, frame_size, bike_types(label)),
             reservation_accessories(quantity, unit_price_cents, accessories(label))`)
    .eq("access_token_hash", tokenHash).maybeSingle();
  return data as unknown as {
    id: string; number: string; status: string; payment_status: string; deposit_status: string; start_at: string; end_at: string;
    billed_days: number; total_cents: number; deposit_amount_cents: number; stripe_customer_id: string | null;
    customers: { email: string } | null; reservation_items: Items; reservation_accessories: Accs;
  } | null;
}

/** Paiement de la location (hébergé par Stripe). Les montants viennent de la base, jamais du navigateur. */
export async function createRentalCheckout(token: string, tokenHash: string): Promise<CheckoutResult> {
  const r = await loadReservation(tokenHash);
  if (!r) return { ok: false, error: "NOT_FOUND" };
  if (r.status !== "pending_payment" || r.payment_status === "succeeded") return { ok: false, error: "NOT_PAYABLE" };

  const lines = [
    ...r.reservation_items.map((i) => ({ name: bikeLineLabel(i.bike_types.label, i.frame_size), qty: i.quantity, unit: i.unit_price_cents })),
    ...r.reservation_accessories.map((i) => ({ name: i.accessories.label, qty: i.quantity, unit: i.unit_price_cents })),
  ];
  // Garde-fou : les lignes envoyées à Stripe doivent égaler le total enregistré.
  if (lines.reduce((s, l) => s + l.qty * l.unit, 0) !== r.total_cents) return { ok: false, error: "TOTAL_MISMATCH" };

  const meta = { reservation_id: r.id, kind: "rental", reservation_number: r.number };
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    allowed_payment_method_types: ["card"],
    locale: "fr",
    line_items: lines.map((l) => ({
      quantity: l.qty,
      price_data: { currency: "eur", unit_amount: l.unit, product_data: { name: `${l.name} (location ${r.number})` } },
    })),
    customer: r.stripe_customer_id ?? undefined,
    customer_email: r.stripe_customer_id ? undefined : r.customers?.email,
    customer_creation: r.stripe_customer_id ? undefined : "always",
    client_reference_id: r.number,
    metadata: meta,
    payment_intent_data: { transfer_group: r.number, metadata: meta },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60 + 30, // minimum Stripe : 30 min
    success_url: `${appUrl()}/r/${token}?paid=1`,
    cancel_url: `${appUrl()}/r/${token}`,
  });
  return session.url ? { ok: true, url: session.url } : { ok: false, error: "NOT_PAYABLE" };
}

/** Empreinte bancaire de la caution (non débitée). Autorisée seulement dans les 24 h avant le retrait. */
export async function createDepositCheckout(token: string, tokenHash: string, now = Date.now()): Promise<CheckoutResult> {
  const r = await loadReservation(tokenHash);
  if (!r) return { ok: false, error: "NOT_FOUND" };
  if (r.payment_status !== "succeeded" || !["confirmed", "ready"].includes(r.status) || r.deposit_status === "authorized" || r.deposit_amount_cents <= 0) {
    return { ok: false, error: "NOT_PAYABLE" };
  }
  if (now < new Date(r.start_at).getTime() - DEPOSIT_WINDOW_MS || now > new Date(r.end_at).getTime()) return { ok: false, error: "TOO_EARLY" };

  const meta = { reservation_id: r.id, kind: "deposit", reservation_number: r.number };
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    allowed_payment_method_types: ["card"],
    locale: "fr",
    line_items: [{
      quantity: 1,
      price_data: { currency: "eur", unit_amount: r.deposit_amount_cents, product_data: { name: `Caution – empreinte bancaire, non débitée (${r.number})` } },
    }],
    customer: r.stripe_customer_id ?? undefined,
    customer_email: r.stripe_customer_id ? undefined : r.customers?.email,
    client_reference_id: r.number,
    metadata: meta,
    payment_intent_data: { capture_method: "manual", metadata: meta },
    // L'autorisation étendue est une fonction réservée : Stripe refuse même la valeur "never" si le compte n'y est pas éligible.
    // On n'envoie donc l'option que si elle est activée explicitement (STRIPE_EXTENDED_AUTH=true) et pour les longues locations.
    ...(process.env.STRIPE_EXTENDED_AUTH === "true" && r.billed_days >= EXTENDED_AUTH_FROM_DAYS
      ? { payment_method_options: { card: { request_extended_authorization: "if_available" as const } } }
      : {}),
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60 + 30,
    success_url: `${appUrl()}/r/${token}?deposit=1`,
    cancel_url: `${appUrl()}/r/${token}`,
  });
  return session.url ? { ok: true, url: session.url } : { ok: false, error: "NOT_PAYABLE" };
}

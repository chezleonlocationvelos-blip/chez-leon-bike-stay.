import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { computeQuote, type BikeTypePricing } from "@/lib/pricing";
import { resolvePeriod, type PeriodInput } from "@/lib/availability/period";
import { DEFAULT_DAY, DEFAULT_SLOTS } from "@/lib/availability/slots";
import { generateAccessToken } from "./token";
import { encrypt, hasAppSecret } from "@/lib/crypto";

export type CreateResult =
  | { ok: true; token: string }
  | { ok: false; error: "NOT_FOUND" | "PAST" | "TOO_LONG" | "EMPTY" | "NO_BIKES" | "NO_PANNIERS" | "CONFLICT" | "RATE_LIMIT" | "SERVER" };

type Args = {
  slug: string;
  period: PeriodInput;
  quantities: Record<string, number>; // par code de type de vélo
  panniers: number;
  customer: { first_name: string; last_name: string; email: string; phone: string };
};

export async function createReservation(a: Args): Promise<CreateResult> {
  const db = createSupabaseServiceClient();

  const { data: acc } = await db.from("accommodations").select("id, is_active").eq("slug", a.slug).maybeSingle();
  if (!acc || !acc.is_active) return { ok: false, error: "NOT_FOUND" };

  // Paramètres administrables (avec valeurs par défaut sûres)
  const { data: settings } = await db.from("application_settings").select("key, value").in("key", ["half_day_slots", "rental_day_rule", "hold_duration_minutes"]);
  const s = Object.fromEntries((settings ?? []).map((r) => [r.key, r.value]));
  const slots = Array.isArray(s.half_day_slots) ? s.half_day_slots : DEFAULT_SLOTS;
  const day = s.rental_day_rule?.pickup_time && s.rental_day_rule?.return_time ? s.rental_day_rule : DEFAULT_DAY;
  const holdMinutes = typeof s.hold_duration_minutes === "number" ? s.hold_duration_minutes : 35;

  let period;
  try {
    period = resolvePeriod(a.period, new Date(), slots, day);
  } catch (e) {
    const m = e instanceof Error ? e.message : "";
    return { ok: false, error: m === "TOO_LONG" ? "TOO_LONG" : "PAST" };
  }

  // Prix lus en base : le navigateur n'envoie jamais de montant.
  const { data: types } = await db.from("bike_types").select("*").eq("is_enabled", true);
  const requested = (types ?? []).filter((t) => (a.quantities[t.code] ?? 0) > 0);
  if (requested.length === 0) return { ok: false, error: "EMPTY" };

  const { data: pannier } = await db.from("accessories").select("id, daily_price_cents").eq("code", "pannier").eq("is_enabled", true).maybeSingle();
  if (a.panniers > 0) {
    if (!pannier) return { ok: false, error: "NO_PANNIERS" };
    // Limite v1 : stock de l'hébergement, sans tenir compte des autres réservations simultanées.
    const { data: stock } = await db.from("accommodation_accessories").select("stock").eq("accommodation_id", acc.id).eq("accessory_id", pannier.id).maybeSingle();
    if (!stock || stock.stock < a.panniers) return { ok: false, error: "NO_PANNIERS" };
  }

  const quote = computeQuote({
    duration: period.duration,
    bikes: requested.map((t) => ({ pricing: t as BikeTypePricing, quantity: a.quantities[t.code] })),
    accessories: pannier && a.panniers > 0 ? [{ daily_price_cents: pannier.daily_price_cents, quantity: a.panniers }] : [],
  });

  const items = requested.map((t) => ({
    bike_type_id: t.id,
    quantity: a.quantities[t.code],
    unit_price_cents: Math.round((computeQuote({ duration: period.duration, bikes: [{ pricing: t as BikeTypePricing, quantity: 1 }] }).bikes_cents)),
  }));
  const accessories = pannier && a.panniers > 0
    ? [{ accessory_id: pannier.id, quantity: a.panniers, unit_price_cents: pannier.daily_price_cents * period.billedDays }]
    : [];

  // Limitation d'abus : peu de réservations non payées par email, et plafond global par hébergement.
  const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const [{ count: byEmail }, { count: byAcc }] = await Promise.all([
    db.from("reservations").select("id, customers!inner(email)", { count: "exact", head: true })
      .eq("status", "pending_payment").gt("created_at", since).eq("customers.email", a.customer.email.toLowerCase()),
    db.from("reservations").select("id", { count: "exact", head: true })
      .eq("status", "pending_payment").gt("created_at", since).eq("accommodation_id", acc.id),
  ]);
  if ((byEmail ?? 0) >= 3 || (byAcc ?? 0) >= 30) return { ok: false, error: "RATE_LIMIT" };

  const { token, hash } = generateAccessToken();
  const { data: reservationId, error } = await db.rpc("create_reservation_draft", {
    p_accommodation_id: acc.id,
    p_start: period.start.toISOString(),
    p_end: period.end.toISOString(),
    p_billed_days: period.billedDays,
    p_items: items,
    p_accessories: accessories,
    p_customer: a.customer,
    p_total_cents: quote.total_cents,
    p_deposit_cents: quote.deposit_cents,
    p_token_hash: hash,
    p_hold_minutes: holdMinutes,
    p_is_demo: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
  });

  if (error) {
    if (error.message.includes("NOT_ENOUGH_BIKES")) return { ok: false, error: "NO_BIKES" };
    if (error.code === "23P01") return { ok: false, error: "CONFLICT" }; // course concurrente : le client peut réessayer
    return { ok: false, error: "SERVER" };
  }
  // Copie chiffrée du lien pour les emails de confirmation et de rappel (le navigateur ne la voit jamais).
  if (hasAppSecret() && typeof reservationId === "string") {
    await db.from("reservations").update({ access_token_enc: encrypt(token) }).eq("id", reservationId);
  }
  return { ok: true, token };
}

import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { computeQuote, type BikeTypePricing } from "@/lib/pricing";
import { resolvePeriod, type PeriodInput } from "@/lib/availability/period";
import { DEFAULT_DAY, DEFAULT_SLOTS } from "@/lib/availability/slots";
import { generateAccessToken } from "./token";
import { encrypt, hasAppSecret } from "@/lib/crypto";
import { loadCatalog } from "./catalog";

/** Réservations qui occupent encore leur matériel (pour le stock d'accessoires). */
const HOLDING = ["pending_payment", "pending_deposit", "confirmed", "access_preparing", "ready", "in_progress", "return_declared"];

export type CreateResult =
  | { ok: true; token: string }
  | { ok: false; error: "NOT_FOUND" | "PAST" | "TOO_LONG" | "EMPTY" | "NO_BIKES" | "NO_PANNIERS" | "CONFLICT" | "RATE_LIMIT" | "SERVER" };

type Args = {
  slug: string;
  period: PeriodInput;
  /** Lignes vélo : type (code), taille (null = indifférente) et quantité. */
  lines: { code: string; size: string | null; quantity: number }[];
  /** Accessoires payants : quantité par code d'accessoire. */
  accessories: Record<string, number>;
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

  // Prix et offre lus en base : le navigateur n'envoie jamais de montant, et ne peut demander que ce qui existe ici.
  const catalog = await loadCatalog(acc.id);
  const wanted = a.lines.filter((l) => l.quantity > 0);
  if (wanted.length === 0) return { ok: false, error: "EMPTY" };
  const bikeLines = [];
  for (const l of wanted) {
    const t = catalog.types.find((x) => x.code === l.code);
    if (!t) return { ok: false, error: "NO_BIKES" };
    if (t.sizes.length > 0 ? !l.size || !t.sizes.includes(l.size) : l.size !== null) return { ok: false, error: "NO_BIKES" };
    bikeLines.push({ type: t, size: l.size, quantity: l.quantity });
  }

  const accLines = [];
  for (const [code, quantity] of Object.entries(a.accessories)) {
    if (quantity <= 0) continue;
    const acc2 = catalog.accessories.find((x) => x.code === code);
    if (!acc2) return { ok: false, error: "NO_PANNIERS" };
    accLines.push({ accessory: acc2, quantity });
  }
  if (accLines.length > 0) {
    // Stock d'accessoires : on retire ce qui est déjà réservé sur une période qui chevauche.
    const { data: busy } = await db.from("reservation_accessories")
      .select("accessory_id, quantity, reservations!inner(accommodation_id, status, start_at, end_at)")
      .in("accessory_id", accLines.map((l) => l.accessory.id))
      .eq("reservations.accommodation_id", acc.id)
      .in("reservations.status", HOLDING)
      .lt("reservations.start_at", period.end.toISOString())
      .gt("reservations.end_at", period.start.toISOString());
    for (const l of accLines) {
      const used = ((busy ?? []) as { accessory_id: string; quantity: number }[])
        .filter((b) => b.accessory_id === l.accessory.id).reduce((n, b) => n + b.quantity, 0);
      if (used + l.quantity > l.accessory.stock) return { ok: false, error: "NO_PANNIERS" };
    }
  }

  const quote = computeQuote({
    duration: period.duration,
    bikes: bikeLines.map((l) => ({ pricing: l.type as BikeTypePricing, quantity: l.quantity })),
    accessories: accLines.map((l) => ({ daily_price_cents: l.accessory.daily_price_cents, quantity: l.quantity })),
  });

  const items = bikeLines.map((l) => ({
    bike_type_id: l.type.id,
    frame_size: l.size,
    quantity: l.quantity,
    unit_price_cents: computeQuote({ duration: period.duration, bikes: [{ pricing: l.type as BikeTypePricing, quantity: 1 }] }).bikes_cents,
  }));
  const accessories = accLines.map((l) => ({
    accessory_id: l.accessory.id, quantity: l.quantity, unit_price_cents: l.accessory.daily_price_cents * period.billedDays,
  }));

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

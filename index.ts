/** Calcul de prix pur, sans accès réseau : toujours exécuté côté serveur (jamais confiance au navigateur). */

export type BikeTypePricing = {
  half_day_price_cents: number;
  daily_price_cents: number;
  two_days_price_cents: number;
  price_from_three_days_cents: number;
  deposit_cents: number;
};

export type Duration = { kind: "half_day" } | { kind: "days"; days: number };

/** Prix d'UN vélo pour une durée donnée. */
export function bikeRentalPrice(p: BikeTypePricing, d: Duration): number {
  if (d.kind === "half_day") return p.half_day_price_cents;
  if (!Number.isInteger(d.days) || d.days < 1) throw new Error("Durée invalide");
  if (d.days === 1) return p.daily_price_cents;
  if (d.days === 2) return p.two_days_price_cents;
  return d.days * p.price_from_three_days_cents;
}

export type QuoteInput = {
  duration: Duration;
  bikes: { pricing: BikeTypePricing; quantity: number }[];
  /** Accessoires facturés (non inclus), ex. sacoches. Un accessoire coûte par jour ; une demi-journée compte 1 jour. */
  accessories?: { daily_price_cents: number; quantity: number }[];
};

export type Quote = { bikes_cents: number; accessories_cents: number; total_cents: number; deposit_cents: number };

export function computeQuote(input: QuoteInput): Quote {
  const billedDays = input.duration.kind === "half_day" ? 1 : input.duration.days;
  let bikes = 0;
  let deposit = 0;
  for (const b of input.bikes) {
    if (!Number.isInteger(b.quantity) || b.quantity < 1) throw new Error("Quantité invalide");
    bikes += bikeRentalPrice(b.pricing, input.duration) * b.quantity;
    deposit += b.pricing.deposit_cents * b.quantity; // pas de plafond de caution (décision client)
  }
  let accessories = 0;
  for (const a of input.accessories ?? []) {
    if (!Number.isInteger(a.quantity) || a.quantity < 0) throw new Error("Quantité invalide");
    accessories += a.daily_price_cents * billedDays * a.quantity;
  }
  return { bikes_cents: bikes, accessories_cents: accessories, total_cents: bikes + accessories, deposit_cents: deposit };
}

/** Commission en points de base (2000 = 20 %), arrondie au centime inférieur ; le reste revient à l'hébergeur. */
export function commissionCents(baseCents: number, commissionBps: number): number {
  return Math.floor((baseCents * commissionBps) / 10000);
}

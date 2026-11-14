import { describe, expect, it } from "vitest";
import { bikeRentalPrice, commissionCents, computeQuote, type BikeTypePricing } from "./index";

const electric: BikeTypePricing = { half_day_price_cents: 2600, daily_price_cents: 3600, two_days_price_cents: 6500, price_from_three_days_cents: 2800, deposit_cents: 100000 };
const classic: BikeTypePricing = { half_day_price_cents: 1600, daily_price_cents: 1900, two_days_price_cents: 3200, price_from_three_days_cents: 1500, deposit_cents: 30000 };

describe("tarifs électriques", () => {
  it("demi-journée 26 €", () => expect(bikeRentalPrice(electric, { kind: "half_day" })).toBe(2600));
  it("1 jour 36 €", () => expect(bikeRentalPrice(electric, { kind: "days", days: 1 })).toBe(3600));
  it("2 jours 65 €", () => expect(bikeRentalPrice(electric, { kind: "days", days: 2 })).toBe(6500));
  it("3 jours 84 € (28 €/j)", () => expect(bikeRentalPrice(electric, { kind: "days", days: 3 })).toBe(8400));
  it("7 jours 196 €", () => expect(bikeRentalPrice(electric, { kind: "days", days: 7 })).toBe(19600));
});

describe("tarifs musculaires", () => {
  it("16 / 19 / 32 / 15 par jour dès 3", () => {
    expect(bikeRentalPrice(classic, { kind: "half_day" })).toBe(1600);
    expect(bikeRentalPrice(classic, { kind: "days", days: 1 })).toBe(1900);
    expect(bikeRentalPrice(classic, { kind: "days", days: 2 })).toBe(3200);
    expect(bikeRentalPrice(classic, { kind: "days", days: 4 })).toBe(6000);
  });
});

describe("devis complet", () => {
  it("2 électriques + 2 musculaires, 3 jours, 2 sacoches", () => {
    const q = computeQuote({
      duration: { kind: "days", days: 3 },
      bikes: [{ pricing: electric, quantity: 2 }, { pricing: classic, quantity: 2 }],
      accessories: [{ daily_price_cents: 500, quantity: 2 }],
    });
    expect(q.bikes_cents).toBe(2 * 8400 + 2 * 4500);
    expect(q.accessories_cents).toBe(2 * 3 * 500);
    expect(q.total_cents).toBe(q.bikes_cents + q.accessories_cents);
    expect(q.deposit_cents).toBe(2 * 100000 + 2 * 30000);
  });
  it("demi-journée : sacoche facturée 1 jour", () => {
    const q = computeQuote({ duration: { kind: "half_day" }, bikes: [{ pricing: classic, quantity: 1 }], accessories: [{ daily_price_cents: 500, quantity: 1 }] });
    expect(q.total_cents).toBe(2100);
  });
  it("rejette quantité ou durée invalides", () => {
    expect(() => bikeRentalPrice(electric, { kind: "days", days: 0 })).toThrow();
    expect(() => computeQuote({ duration: { kind: "days", days: 1 }, bikes: [{ pricing: electric, quantity: 0 }] })).toThrow();
  });
});

describe("commission", () => {
  it("20 % de 84 € = 16,80 €", () => expect(commissionCents(8400, 2000)).toBe(1680));
  it("arrondi inférieur", () => expect(commissionCents(3333, 2000)).toBe(666));
});

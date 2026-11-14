import { describe, expect, it } from "vitest";
import { resolvePeriod } from "./period";

const noon = new Date("2027-07-14T10:00:00Z"); // 12h00 à Paris (été)

describe("resolvePeriod", () => {
  it("réservation le jour même autorisée (journée complète à midi)", () => {
    const r = resolvePeriod({ mode: "days", start_date: "2027-07-14", end_date: "2027-07-14" }, noon);
    expect(r.billedDays).toBe(1);
  });
  it("demi-journée de l'après-midi réservable à midi", () => {
    expect(() => resolvePeriod({ mode: "half_day", date: "2027-07-14", slot: "afternoon" }, noon)).not.toThrow();
  });
  it("demi-journée du matin presque terminée (15 min restantes) : refusée", () => {
    const almostOver = new Date("2027-07-14T10:45:00Z"); // 12h45 à Paris, fin du créneau à 13h00
    expect(() => resolvePeriod({ mode: "half_day", date: "2027-07-14", slot: "morning" }, almostOver)).toThrow("PAST");
  });
  it("demi-journée du matin en cours (1 h restante) : autorisée", () => {
    expect(() => resolvePeriod({ mode: "half_day", date: "2027-07-14", slot: "morning" }, noon)).not.toThrow();
  });
  it("jour passé refusé", () => {
    expect(() => resolvePeriod({ mode: "days", start_date: "2027-07-13", end_date: "2027-07-13" }, noon)).toThrow("PAST");
  });
  it("à moins de 30 min de la fin : refusé", () => {
    const late = new Date("2027-07-14T16:10:00Z"); // 18h10 à Paris, fin à 18h30
    expect(() => resolvePeriod({ mode: "days", start_date: "2027-07-14", end_date: "2027-07-14" }, late)).toThrow("PAST");
  });
  it("durée maximale 30 jours", () => {
    expect(() => resolvePeriod({ mode: "days", start_date: "2027-07-14", end_date: "2027-09-01" }, noon)).toThrow("TOO_LONG");
  });
  it("3 jours → durée facturée 3", () => {
    const r = resolvePeriod({ mode: "days", start_date: "2027-07-14", end_date: "2027-07-16" }, noon);
    expect(r.duration).toEqual({ kind: "days", days: 3 });
  });
});

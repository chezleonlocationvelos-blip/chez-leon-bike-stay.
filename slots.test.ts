import { describe, expect, it } from "vitest";
import { daysRange, halfDayRange, overlaps, parisToUtc } from "./slots";

describe("heure de Paris → UTC", () => {
  it("été (UTC+2) : 9h00 = 07:00Z", () => expect(parisToUtc("2027-07-14", "09:00").toISOString()).toBe("2027-07-14T07:00:00.000Z"));
  it("hiver (UTC+1) : 9h00 = 08:00Z", () => expect(parisToUtc("2027-01-14", "09:00").toISOString()).toBe("2027-01-14T08:00:00.000Z"));
  it("jour du passage à l'heure d'été 2027 (28 mars)", () => {
    expect(parisToUtc("2027-03-28", "09:00").toISOString()).toBe("2027-03-28T07:00:00.000Z");
  });
});

describe("demi-journées", () => {
  it("matin 9h-13h = 4 h", () => {
    const r = halfDayRange("2027-07-14", "morning");
    expect((r.end.getTime() - r.start.getTime()) / 3_600_000).toBe(4);
  });
  it("après-midi 14h30-18h30 = 4 h", () => {
    const r = halfDayRange("2027-07-14", "afternoon");
    expect((r.end.getTime() - r.start.getTime()) / 3_600_000).toBe(4);
  });
  it("matin et après-midi d'un même vélo ne se chevauchent pas", () => {
    expect(overlaps(halfDayRange("2027-07-14", "morning"), halfDayRange("2027-07-14", "afternoon"))).toBe(false);
  });
  it("créneau inconnu rejeté", () => expect(() => halfDayRange("2027-07-14", "night")).toThrow());
});

describe("plusieurs jours", () => {
  it("1 jour facturé pour 9h-18h30 le même jour", () => expect(daysRange("2027-07-14", "2027-07-14").billedDays).toBe(1));
  it("3 jours du 14 au 16", () => {
    const r = daysRange("2027-07-14", "2027-07-16");
    expect(r.billedDays).toBe(3);
    expect(r.start.toISOString()).toBe("2027-07-14T07:00:00.000Z");
    expect(r.end.toISOString()).toBe("2027-07-16T16:30:00.000Z");
  });
  it("le lendemain 9h n'entre pas en conflit avec un retour à 18h30", () => {
    expect(overlaps(daysRange("2027-07-14", "2027-07-14"), daysRange("2027-07-15", "2027-07-15"))).toBe(false);
  });
  it("dates inversées rejetées", () => expect(() => daysRange("2027-07-16", "2027-07-14")).toThrow());
});

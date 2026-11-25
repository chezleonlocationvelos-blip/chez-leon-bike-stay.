import { describe, expect, it } from "vitest";
import { daysCovered, nextDays, parseRange } from "./planning";

describe("planning", () => {
  it("lit une plage Postgres", () => {
    const r = parseRange('["2026-11-25 08:00:00+00","2026-11-25 17:30:00+00")');
    expect(r?.start.toISOString()).toBe("2026-11-25T08:00:00.000Z");
    expect(r?.end.toISOString()).toBe("2026-11-25T17:30:00.000Z");
  });
  it("refuse une plage illisible", () => {
    expect(parseRange("n'importe quoi")).toBeNull();
  });
  it("une journée 9h-18h30 ne couvre qu'un jour", () => {
    const r = parseRange('["2026-07-10 07:00:00+00","2026-07-10 16:30:00+00")')!;
    expect(daysCovered(r.start, r.end)).toEqual({ from: "2026-07-10", to: "2026-07-10" });
  });
  it("trois jours couvrent trois dates", () => {
    const r = parseRange('["2026-07-10 07:00:00+00","2026-07-12 16:30:00+00")')!;
    expect(daysCovered(r.start, r.end)).toEqual({ from: "2026-07-10", to: "2026-07-12" });
  });
  it("enchaîne les jours en changeant de mois", () => {
    expect(nextDays("2026-11-29", 3)).toEqual(["2026-11-29", "2026-11-30", "2026-12-01"]);
  });
});

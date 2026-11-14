import { describe, expect, it } from "vitest";
import { depositOutcome } from "./deposit";

describe("depositOutcome", () => {
  it("aucun dommage : libération", () => expect(depositOutcome(0, 100000)).toEqual({ action: "release" }));
  it("dommage partiel : capture du montant", () => expect(depositOutcome(15000, 100000)).toEqual({ action: "capture", amountCents: 15000 }));
  it("dommage égal à la caution : capture totale", () => expect(depositOutcome(100000, 100000)).toEqual({ action: "capture", amountCents: 100000 }));
  it("dommage supérieur à la caution : refusé (la caution est un plafond)", () => expect(() => depositOutcome(100001, 100000)).toThrow("INVALID_AMOUNT"));
  it("montant négatif ou décimal : refusé", () => {
    expect(() => depositOutcome(-1, 100000)).toThrow();
    expect(() => depositOutcome(10.5, 100000)).toThrow();
  });
});

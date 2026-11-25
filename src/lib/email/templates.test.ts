import { describe, expect, it } from "vitest";
import { reviewRequestEmail } from "./templates";

describe("e-mail de demande d'avis", () => {
  it("boutique : renvoie vers la fiche Google", () => {
    const m = reviewRequestEmail({ firstName: "Léa", accommodation: "Boutique", number: "CL-1", link: "https://x/avis/t", googleUrl: "https://g/write" });
    expect(m.html).toContain("https://g/write");
    expect(m.html).not.toContain("https://x/avis/t");
    expect(m.text).toContain("https://g/write");
  });
  it("hébergement : garde l'avis interne", () => {
    const m = reviewRequestEmail({ firstName: "Léa", accommodation: "Yourte", number: "CL-2", link: "https://x/avis/t" });
    expect(m.html).toContain("https://x/avis/t");
  });
});

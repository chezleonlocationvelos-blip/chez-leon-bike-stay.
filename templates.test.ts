import { describe, expect, it } from "vitest";
import { confirmationEmail, depositReminderEmail, esc } from "./templates";

const base = { firstName: "Léa", number: "CL-2027-0001", accommodation: "Domaine", startLabel: "mercredi 14 juillet 09:00", endLabel: "mercredi 14 juillet 18:30", link: "https://bike.example.fr/r/abc" };

describe("emails", () => {
  it("échappe le HTML dans les champs variables", () => {
    expect(esc('<script>alert("x")</script>')).not.toContain("<script>");
    const m = confirmationEmail({ ...base, firstName: "<img src=x onerror=1>", lines: [{ label: "<b>Vélo</b>", qty: 1, totalCents: 3600 }], totalCents: 3600, depositCents: 100000 });
    expect(m.html).not.toContain("<img src=x");
    expect(m.html).not.toContain("<b>Vélo</b>");
  });
  it("la confirmation contient le lien, le total et la caution", () => {
    const m = confirmationEmail({ ...base, lines: [{ label: "Vélo électrique", qty: 2, totalCents: 8400 }], totalCents: 8400, depositCents: 200000 });
    expect(m.html).toContain("https://bike.example.fr/r/abc");
    expect(m.text).toContain("84");
    expect(m.subject).toContain("CL-2027-0001");
  });
  it("le rappel pointe vers la page de réservation", () => {
    const m = depositReminderEmail({ ...base, depositCents: 30000 });
    expect(m.html).toContain("https://bike.example.fr/r/abc");
    expect(m.subject).toContain("caution");
  });
});

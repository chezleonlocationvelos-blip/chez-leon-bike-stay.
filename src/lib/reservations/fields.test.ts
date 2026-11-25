import { describe, expect, it } from "vitest";
import { accessoryField, qtyField } from "./fields";
import { bikeLineLabel } from "../labels";

describe("champs et libellés de réservation", () => {
  it("nomme les compteurs par type et taille", () => {
    expect(qtyField("classic", "M")).toBe("qty_classic__M");
    expect(qtyField("electric", "L/XL")).toBe("qty_electric__L/XL");
    expect(qtyField("tandem", null)).toBe("qty_tandem");
    expect(accessoryField("child_trailer")).toBe("acc_child_trailer");
  });
  it("affiche la taille dans le libellé", () => {
    expect(bikeLineLabel("Vélo classique", "M")).toBe("Vélo classique (taille M)");
    expect(bikeLineLabel("Tandem", null)).toBe("Tandem");
  });
});

import { describe, expect, it } from "vitest";
import { randomBytes } from "crypto";
import { decrypt, encrypt } from "./crypto";

const secret = randomBytes(32).toString("base64");

describe("chiffrement AES-GCM", () => {
  it("aller-retour", () => expect(decrypt(encrypt("jeton-secret", secret), secret)).toBe("jeton-secret"));
  it("deux chiffrements du même texte diffèrent (IV aléatoire)", () => expect(encrypt("a", secret)).not.toBe(encrypt("a", secret)));
  it("le clair n'apparaît pas dans le chiffré", () => expect(encrypt("jeton-secret", secret)).not.toContain("jeton"));
  it("mauvaise clé : échec", () => expect(() => decrypt(encrypt("x", secret), randomBytes(32).toString("base64"))).toThrow());
  it("donnée altérée : échec", () => {
    const [iv, tag, data] = encrypt("x", secret).split(".");
    const tampered = [iv, tag, Buffer.from("zz").toString("base64url") + data].join(".");
    expect(() => decrypt(tampered, secret)).toThrow();
  });
  it("clé de mauvaise taille refusée", () => expect(() => encrypt("x", Buffer.from("court").toString("base64"))).toThrow());
});

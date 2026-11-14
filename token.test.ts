import { describe, expect, it } from "vitest";
import { generateAccessToken, hashToken } from "./token";

describe("jeton d'accès", () => {
  it("le hash correspond au jeton et ne le révèle pas", () => {
    const { token, hash } = generateAccessToken();
    expect(hashToken(token)).toBe(hash);
    expect(hash).not.toContain(token);
    expect(token.length).toBeGreaterThanOrEqual(43);
  });
  it("deux jetons sont différents", () => {
    expect(generateAccessToken().token).not.toBe(generateAccessToken().token);
  });
});

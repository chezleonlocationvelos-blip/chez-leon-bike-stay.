import { createHash, randomBytes } from "crypto";

/** Jeton secret du lien client : 256 bits aléatoires. Seul son hash est stocké en base. */
export function generateAccessToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

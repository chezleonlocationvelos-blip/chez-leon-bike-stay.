import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

/** Chiffrement AES-256-GCM. Format : base64url(iv).base64url(tag).base64url(données). La clé APP_SECRET fait 32 octets en base64. */
function key(secret = process.env.APP_SECRET): Buffer {
  if (!secret) throw new Error("APP_SECRET manquante");
  const k = Buffer.from(secret, "base64");
  if (k.length !== 32) throw new Error("APP_SECRET doit contenir 32 octets (base64)");
  return k;
}

export function encrypt(plain: string, secret?: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(secret), iv);
  const data = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(payload: string, secret?: string): string {
  const [iv, tag, data] = payload.split(".").map((p) => Buffer.from(p, "base64url"));
  if (!iv || !tag || !data) throw new Error("Format invalide");
  const d = createDecipheriv("aes-256-gcm", key(secret), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(data), d.final()]).toString("utf8");
}

export const hasAppSecret = () => !!process.env.APP_SECRET;

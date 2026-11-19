import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/reservations/token";

export const runtime = "nodejs";
const MAX_PHOTOS = 12;
const MAX_BYTES = 2 * 1024 * 1024;
const OPEN = ["confirmed", "ready", "in_progress"];

/** Reçoit une photo de restitution prise en direct dans l'appli (flux caméra → canevas → JPEG). */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const token = String(form?.get("token") ?? "");
  const file = form?.get("photo");
  if (!token || !(file instanceof File)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (file.size === 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "size" }, { status: 413 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (!isJpeg) return NextResponse.json({ error: "type" }, { status: 415 });

  const db = createSupabaseServiceClient();
  const { data: r } = await db.from("reservations").select("id, status").eq("access_token_hash", hashToken(token)).maybeSingle();
  if (!r || !OPEN.includes(r.status)) return NextResponse.json({ error: "closed" }, { status: 403 });

  const { count } = await db.from("reservation_return_photos").select("id", { count: "exact", head: true }).eq("reservation_id", r.id);
  if ((count ?? 0) >= MAX_PHOTOS) return NextResponse.json({ error: "limit" }, { status: 429 });

  const kind = String(form?.get("kind") ?? "bike");
  if (kind !== "bike" && kind !== "keybox") return NextResponse.json({ error: "invalid" }, { status: 400 });
  const label = String(form?.get("label") ?? "").slice(0, 80) || null;
  const num = (k: string) => { const v = Number(form?.get(k)); return Number.isFinite(v) && form?.get(k) !== null && form?.get(k) !== "" ? v : null; };
  const path = `${r.id}/${randomUUID()}.jpg`;
  const up = await db.storage.from("return-photos").upload(path, bytes, { contentType: "image/jpeg", upsert: false });
  if (up.error) return NextResponse.json({ error: "upload" }, { status: 500 });

  const { error } = await db.from("reservation_return_photos").insert({
    reservation_id: r.id, storage_path: path, kind, label,
    latitude: num("lat"), longitude: num("lng"), accuracy_m: num("acc"),
    user_agent: (req.headers.get("user-agent") ?? "").slice(0, 300),
  });
  if (error) { await db.storage.from("return-photos").remove([path]); return NextResponse.json({ error: "db" }, { status: 500 }); }
  return NextResponse.json({ count: (count ?? 0) + 1 });
}

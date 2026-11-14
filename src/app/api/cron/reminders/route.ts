import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/email/notify";

export const runtime = "nodejs";
const WINDOW_HOURS = 40; // tâche quotidienne : couvre les locations du lendemain matin

/** Appelée chaque jour par Vercel Cron (en-tête Authorization: Bearer CRON_SECRET). */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new NextResponse("Unauthorized", { status: 401 });

  const db = createSupabaseServiceClient();
  await db.rpc("release_expired_holds");
  const now = new Date();
  const { data } = await db.from("reservations").select("id")
    .eq("status", "confirmed").eq("payment_status", "succeeded").neq("deposit_status", "authorized").eq("is_demo", false)
    .gt("start_at", now.toISOString()).lt("start_at", new Date(now.getTime() + WINDOW_HOURS * 3600_000).toISOString());

  const out = { sent: 0, skipped: 0, duplicate: 0, failed: 0 };
  for (const r of data ?? []) {
    try { out[await notify(r.id, "deposit_reminder")]++; } catch { out.failed++; }
  }
  return NextResponse.json(out);
}

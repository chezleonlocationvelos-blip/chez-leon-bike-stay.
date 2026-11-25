import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Lien court à mettre sur chezleonlocation.com (bouton « Réserver ») : renvoie vers la page de réservation de la boutique. */
export async function GET(req: Request) {
  const db = createSupabaseServiceClient();
  const { data } = await db.from("accommodations").select("slug").eq("mode", "counter").eq("is_active", true).order("created_at").limit(1).maybeSingle();
  return NextResponse.redirect(new URL(data ? `/h/${data.slug}` : "/", req.url), 307);
}

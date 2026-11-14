"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

/** L'hébergeur signale que les vélos sont rentrés. Chez Léon valide ensuite et règle la caution. */
export async function declareReturn(reservationId: string) {
  const { userId } = await requireRole("partner");
  // Lecture avec la session du partenaire : la RLS garantit que la réservation est bien dans son établissement.
  const supabase = await createSupabaseServerClient();
  const { data: own } = await supabase.from("reservations").select("id, status").eq("id", reservationId).maybeSingle();
  if (!own) redirect("/partner");
  if (own.status === "ready") {
    const db = createSupabaseServiceClient();
    await db.from("reservations").update({ status: "return_declared" }).eq("id", own.id).eq("status", "ready");
    await db.from("audit_logs").insert({ actor_id: userId, action: "reservation.return_declared", entity: "reservation", entity_id: own.id });
  }
  revalidatePath("/partner");
  redirect("/partner");
}

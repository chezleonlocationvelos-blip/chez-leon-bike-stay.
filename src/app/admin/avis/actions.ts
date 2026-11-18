"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/roles";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

export async function setReviewStatus(id: string, status: "published" | "hidden") {
  const { userId } = await requireRole("admin");
  const db = createSupabaseServiceClient();
  await db.from("reviews").update({ status }).eq("id", id);
  await db.from("audit_logs").insert({ actor_id: userId, action: `review.${status}`, entity: "review", entity_id: id, details: {} });
  revalidatePath("/admin/avis");
}

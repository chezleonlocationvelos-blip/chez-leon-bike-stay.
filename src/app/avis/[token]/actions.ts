"use server";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/reservations/token";

/** Enregistre l'avis d'un client. Uniquement via le lien secret d'une réservation terminée, un seul avis par réservation. Publication après modération. */
export async function submitReview(token: string, formData: FormData) {
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 1000);
  const name = String(formData.get("display_name") ?? "").trim().slice(0, 60);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !name) redirect(`/avis/${token}?error=1`);

  const db = createSupabaseServiceClient();
  const { data: r } = await db.from("reservations").select("id, accommodation_id, status, is_demo")
    .eq("access_token_hash", hashToken(token)).maybeSingle();
  if (!r || r.status !== "completed" || r.is_demo) redirect(`/avis/${token}?error=1`);

  const { error } = await db.from("reviews").insert({
    reservation_id: r.id, accommodation_id: r.accommodation_id, rating,
    comment: comment || null, display_name: name,
  });
  if (error && error.code !== "23505") redirect(`/avis/${token}?error=1`);
  redirect(`/avis/${token}?merci=1`);
}

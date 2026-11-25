"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { accommodationSchema, emptyToNull } from "@/lib/validation/admin";

export async function saveAccommodation(formData: FormData) {
  const { userId } = await requireRole("admin"); // contrôle serveur systématique
  const id = (formData.get("id") as string | null) || null;
  const back = id ? `/admin/accommodations/${id}` : "/admin/accommodations/new";

  const parsed = accommodationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${back}?error=validation`);

  const { commission_percent, ...rest } = parsed.data;
  const row = {
    ...emptyToNull(rest),
    // La boutique Chez Léon n'a jamais de commission : c'est Chez Léon qui encaisse.
    commission_bps: rest.mode === "counter" ? 0 : Math.round(commission_percent * 100),
    is_active: formData.get("is_active") === "on",
  };

  const supabase = await createSupabaseServerClient();
  const query = id
    ? supabase.from("accommodations").update(row).eq("id", id).select("id").single()
    : supabase.from("accommodations").insert(row).select("id").single();
  const { data, error } = await query;
  if (error || !data) redirect(`${back}?error=${error?.code === "23505" ? "slug_taken" : "save"}`);

  // Journalisation des opérations sensibles (le commission_bps en fait partie).
  await createSupabaseServiceClient().from("audit_logs").insert({
    actor_id: userId,
    action: id ? "accommodation.update" : "accommodation.create",
    entity: "accommodation",
    entity_id: data.id,
    details: { commission_bps: row.commission_bps, is_active: row.is_active, mode: rest.mode },
  });

  revalidatePath("/admin/accommodations");
  redirect("/admin/accommodations");
}

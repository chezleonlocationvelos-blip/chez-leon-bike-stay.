"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { bikeUpdateSchema, emptyToNull } from "@/lib/validation/admin";

export async function updateBike(formData: FormData) {
  const { userId } = await requireRole("admin");
  const parsed = bikeUpdateSchema.safeParse(Object.fromEntries(formData));
  const id = String(formData.get("id") ?? "");
  const back = `/admin/bikes/${id}`;
  if (!parsed.success) redirect(`${back}?error=validation`);

  const supabase = await createSupabaseServerClient();
  const { data: current } = await supabase.from("bikes").select("status, accommodation_id").eq("id", parsed.data.id).maybeSingle();
  if (!current) redirect("/admin/bikes");

  // Un vélo réservé ou en location ne se modifie pas à la main : il faut d'abord traiter la réservation.
  if (current.status === "reserved" || current.status === "rented") redirect(`${back}?error=in_use`);

  const next = emptyToNull({ accommodation_id: parsed.data.accommodation_id, notes: parsed.data.notes });
  // Sans hébergement, un vélo ne peut pas être disponible.
  if (parsed.data.status === "available" && !next.accommodation_id) redirect(`${back}?error=needs_accommodation`);

  const { error } = await supabase.from("bikes").update({ ...next, status: parsed.data.status }).eq("id", parsed.data.id);
  if (error) redirect(`${back}?error=save`);

  const service = createSupabaseServiceClient();
  await service.from("bike_events").insert({
    bike_id: parsed.data.id, event_type: "admin_update", actor_id: userId,
    from_status: current.status, to_status: parsed.data.status,
    details: { from_accommodation: current.accommodation_id, to_accommodation: next.accommodation_id },
  });
  revalidatePath("/admin/bikes");
  redirect("/admin/bikes");
}

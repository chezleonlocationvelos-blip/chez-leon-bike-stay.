"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { bikeSchema, emptyToNull } from "@/lib/validation/admin";

export async function createBike(formData: FormData) {
  const { userId } = await requireRole("admin");
  const parsed = bikeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/bikes/new?error=validation");

  const row = { ...emptyToNull(parsed.data), status: "unavailable" as const };
  const supabase = await createSupabaseServerClient();
  if (!(await sizeAllowed(supabase, parsed.data.bike_type_id, parsed.data.frame_size))) redirect("/admin/bikes/new?error=size");
  const { data, error } = await supabase.from("bikes").insert(row).select("id").single();
  if (error || !data) redirect(`/admin/bikes/new?error=${error?.code === "23505" ? "duplicate" : "save"}`);

  await createSupabaseServiceClient().from("audit_logs").insert({
    actor_id: userId, action: "bike.create", entity: "bike", entity_id: data.id,
    details: { internal_code: parsed.data.internal_code },
  });
  revalidatePath("/admin/bikes");
  redirect("/admin/bikes");
}

/** Une taille doit appartenir à la liste du type ; un type sans tailles n'accepte que « taille unique ». */
async function sizeAllowed(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, typeId: string, size?: string | null) {
  const { data } = await supabase.from("bike_types").select("sizes").eq("id", typeId).maybeSingle();
  const sizes = (data?.sizes ?? []) as string[];
  return size ? sizes.includes(size) : sizes.length === 0;
}

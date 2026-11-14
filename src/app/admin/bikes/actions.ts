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
  const { data, error } = await supabase.from("bikes").insert(row).select("id").single();
  if (error || !data) redirect(`/admin/bikes/new?error=${error?.code === "23505" ? "duplicate" : "save"}`);

  await createSupabaseServiceClient().from("audit_logs").insert({
    actor_id: userId, action: "bike.create", entity: "bike", entity_id: data.id,
    details: { internal_code: parsed.data.internal_code },
  });
  revalidatePath("/admin/bikes");
  redirect("/admin/bikes");
}

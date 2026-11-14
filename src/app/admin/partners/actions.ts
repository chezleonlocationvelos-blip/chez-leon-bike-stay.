"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/roles";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { partnerSchema } from "@/lib/validation/admin";

export async function createPartner(formData: FormData) {
  const { userId } = await requireRole("admin");
  const parsed = partnerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/partners?error=validation");

  const db = createSupabaseServiceClient();
  const { data, error } = await db.auth.admin.createUser({
    email: parsed.data.email, password: parsed.data.password, email_confirm: true,
  });
  if (error || !data.user) redirect(`/admin/partners?error=${error?.message?.includes("already") ? "exists" : "create"}`);

  const partnerId = data.user.id;
  const { error: roleErr } = await db.from("user_roles").insert({ user_id: partnerId, role: "partner" });
  const { error: linkErr } = await db.from("accommodation_users").insert({ user_id: partnerId, accommodation_id: parsed.data.accommodation_id });
  if (roleErr || linkErr) {
    await db.auth.admin.deleteUser(partnerId); // pas de compte à moitié créé
    redirect("/admin/partners?error=create");
  }

  await db.from("audit_logs").insert({
    actor_id: userId, action: "partner.create", entity: "user", entity_id: partnerId,
    details: { accommodation_id: parsed.data.accommodation_id },
  });
  revalidatePath("/admin/partners");
  redirect("/admin/partners?saved=1");
}

"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { accessoryPricingSchema, bikeTypePricingSchema, maxDepositSchema } from "@/lib/validation/admin";

export async function updateBikeTypePricing(formData: FormData) {
  const { userId } = await requireRole("admin");
  const parsed = bikeTypePricingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/pricing?error=validation");

  const { id, half_day_eur, price_eur, two_days_eur, from_three_eur, deposit_eur } = parsed.data;
  const cents = (n: number) => Math.round(n * 100);
  const values = {
    half_day_price_cents: cents(half_day_eur), daily_price_cents: cents(price_eur),
    two_days_price_cents: cents(two_days_eur), price_from_three_days_cents: cents(from_three_eur),
    deposit_cents: cents(deposit_eur),
    is_enabled: formData.get("is_enabled") === "on",
  };
  // Pas de location gratuite par erreur : un type proposé doit avoir ses prix.
  if (values.is_enabled && (values.daily_price_cents === 0 || values.half_day_price_cents === 0)) redirect("/admin/pricing?error=price_required");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("bike_types")
    .update(values)
    .eq("id", id);
  if (error) redirect("/admin/pricing?error=save");

  await createSupabaseServiceClient().from("audit_logs").insert({
    actor_id: userId, action: "pricing.update", entity: "bike_type", entity_id: id,
    details: values,
  });
  revalidatePath("/admin/pricing");
  redirect("/admin/pricing?saved=1");
}

export async function updateMaxDeposit(formData: FormData) {
  const { userId } = await requireRole("admin");
  const raw = String(formData.get("max_deposit_eur") ?? "").trim();
  const supabase = await createSupabaseServerClient();

  // Champ vide = aucun plafond (décision actuelle) : on supprime le paramètre.
  if (raw === "") {
    const { error } = await supabase.from("application_settings").delete().eq("key", "max_deposit_cents");
    if (error) redirect("/admin/pricing?error=save");
  } else {
    const parsed = maxDepositSchema.safeParse({ max_deposit_eur: raw });
    if (!parsed.success) redirect("/admin/pricing?error=validation");
    const cents = Math.round(parsed.data.max_deposit_eur * 100);
    const { error } = await supabase
      .from("application_settings")
      .upsert({ key: "max_deposit_cents", value: cents, updated_at: new Date().toISOString() });
    if (error) redirect("/admin/pricing?error=save");
  }

  await createSupabaseServiceClient().from("audit_logs").insert({
    actor_id: userId, action: "settings.max_deposit", entity: "application_settings", entity_id: "max_deposit_cents",
    details: { value: raw === "" ? null : raw },
  });
  revalidatePath("/admin/pricing");
  redirect("/admin/pricing?saved=1");
}

/** Prix par jour d'un accessoire payant et activation (un accessoire activé n'apparaît que là où il y a du stock). */
export async function updateAccessory(formData: FormData) {
  const { userId } = await requireRole("admin");
  const parsed = accessoryPricingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/pricing?error=validation");
  const values = {
    label: parsed.data.label,
    daily_price_cents: Math.round(parsed.data.price_eur * 100),
    is_enabled: formData.get("is_enabled") === "on",
  };
  if (values.is_enabled && values.daily_price_cents === 0) redirect("/admin/pricing?error=price_required");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("accessories").update(values).eq("id", parsed.data.id).eq("is_included", false);
  if (error) redirect("/admin/pricing?error=save");
  await createSupabaseServiceClient().from("audit_logs").insert({
    actor_id: userId, action: "accessory.update", entity: "accessory", entity_id: parsed.data.id, details: values,
  });
  revalidatePath("/admin/pricing");
  redirect("/admin/pricing?saved=1");
}

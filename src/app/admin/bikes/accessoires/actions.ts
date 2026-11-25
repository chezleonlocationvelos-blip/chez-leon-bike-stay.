"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

const schema = z.object({
  id: z.string().uuid(),
  shop_id: z.string().uuid(),
  label: z.string().trim().min(2).max(60),
  price_eur: z.coerce.number().min(0).max(500),
  stock: z.coerce.number().int().min(0).max(200),
});

/** Enregistre en une fois le nom, le prix par jour, l'activation et le stock en boutique d'un accessoire payant. */
export async function saveShopAccessory(formData: FormData) {
  const { userId } = await requireRole("admin");
  const back = "/admin/bikes/accessoires";
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${back}?error=validation`);
  const { id, shop_id, label, price_eur, stock } = parsed.data;
  const values = { label, daily_price_cents: Math.round(price_eur * 100), is_enabled: formData.get("is_enabled") === "on" };
  // Pas de location gratuite par erreur.
  if (values.is_enabled && values.daily_price_cents === 0) redirect(`${back}?error=price_required`);

  const supabase = await createSupabaseServerClient();
  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("accessories").update(values).eq("id", id).eq("is_included", false),
    supabase.from("accommodation_accessories").upsert({ accommodation_id: shop_id, accessory_id: id, stock }, { onConflict: "accommodation_id,accessory_id" }),
  ]);
  if (e1 || e2) redirect(`${back}?error=save`);

  await createSupabaseServiceClient().from("audit_logs").insert({
    actor_id: userId, action: "accessory.update", entity: "accessory", entity_id: id, details: { ...values, shop_stock: stock },
  });
  revalidatePath(back);
  redirect(`${back}?saved=1`);
}

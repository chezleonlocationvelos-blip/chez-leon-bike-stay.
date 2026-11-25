"use server";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { createReservation } from "@/lib/reservations/create";
import { customerSchema, MAX_PANNIERS, MAX_PER_TYPE, parseQuantity, periodSchema } from "@/lib/reservations/schema";
import { accessoryField, loadCatalog, qtyField } from "@/lib/reservations/catalog";

export async function submitReservation(slug: string, formData: FormData) {
  const back = (e: string) => redirect(`/h/${slug}?error=${e}`);
  const raw = Object.fromEntries(formData);
  if (String(raw.website ?? "") !== "") return back("server"); // champ piège rempli : robot

  const customer = customerSchema.safeParse(raw);
  if (!customer.success) return back("customer");

  const period = periodSchema.safeParse(
    raw.mode === "half_day"
      ? { mode: "half_day", date: raw.date, slot: raw.slot }
      : { mode: "days", start_date: raw.start_date, end_date: raw.end_date },
  );
  if (!period.success) return back("period");

  const db = createSupabaseServiceClient();
  const { data: acc } = await db.from("accommodations").select("id").eq("slug", slug).maybeSingle();
  if (!acc) return back("not_found");
  const catalog = await loadCatalog(acc.id);
  const lines: { code: string; size: string | null; quantity: number }[] = [];
  const accessories: Record<string, number> = {};
  try {
    for (const t of catalog.types) {
      for (const size of t.sizes.length > 0 ? t.sizes : [null]) {
        const quantity = parseQuantity(formData.get(qtyField(t.code, size)), MAX_PER_TYPE);
        if (quantity > 0) lines.push({ code: t.code, size, quantity });
      }
    }
    for (const a of catalog.accessories) {
      // « panniers » : ancien nom du champ sacoches, accepté pour les pages déjà ouvertes.
      const raw = formData.get(accessoryField(a.code)) ?? (a.code === "pannier" ? formData.get("panniers") : null);
      accessories[a.code] = parseQuantity(raw, MAX_PANNIERS);
    }
  } catch {
    return back("quantity");
  }

  const { accept_terms: _accept, ...c } = customer.data;
  const result = await createReservation({ slug, period: period.data, lines, accessories, customer: c });
  if (!result.ok) return back(result.error.toLowerCase());
  redirect(`/r/${result.token}`);
}

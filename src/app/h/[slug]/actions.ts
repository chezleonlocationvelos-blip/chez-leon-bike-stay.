"use server";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { createReservation } from "@/lib/reservations/create";
import { customerSchema, MAX_PANNIERS, MAX_PER_TYPE, parseQuantity, periodSchema } from "@/lib/reservations/schema";

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
  const { data: types } = await db.from("bike_types").select("code").eq("is_enabled", true);
  const quantities: Record<string, number> = {};
  let panniers = 0;
  try {
    for (const t of types ?? []) quantities[t.code] = parseQuantity(formData.get(`qty_${t.code}`), MAX_PER_TYPE);
    panniers = parseQuantity(formData.get("panniers"), MAX_PANNIERS);
  } catch {
    return back("quantity");
  }

  const { accept_terms: _accept, ...c } = customer.data;
  const result = await createReservation({ slug, period: period.data, quantities, panniers, customer: c });
  if (!result.ok) return back(result.error.toLowerCase());
  redirect(`/r/${result.token}`);
}

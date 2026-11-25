import { z } from "zod";

export const accommodationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "slug").min(3).max(60),
  type: z.string().trim().min(2).max(40),
  address: z.string().trim().max(200).optional(),
  city: z.string().trim().max(80).optional(),
  postal_code: z.string().trim().max(10).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
  manager_name: z.string().trim().max(80).optional(),
  access_hours: z.string().trim().max(120).optional(),
  access_instructions: z.string().trim().max(1000).optional(),
  commission_percent: z.coerce.number().min(0).max(100),
  mode: z.enum(["self_service", "counter"]).default("self_service"),
});

export const bikeSchema = z.object({
  internal_code: z.string().trim().toUpperCase().regex(/^[A-Z]+-\d{3,}$/, "code"),
  bike_type_id: z.string().uuid(),
  accommodation_id: z.string().uuid().optional().or(z.literal("")),
  brand: z.string().trim().max(60).optional(),
  model: z.string().trim().max(60).optional(),
  frame_size: z.string().trim().max(20).optional(),
  serial_number: z.string().trim().max(60).optional(),
});

/** Transforme les champs vides du formulaire en null pour la base. */
export function emptyToNull<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === "" || v === undefined ? null : v]));
}

export const bikeTypePricingSchema = z.object({
  id: z.string().uuid(),
  half_day_eur: z.coerce.number().min(0).max(1000),
  price_eur: z.coerce.number().min(0).max(1000),
  two_days_eur: z.coerce.number().min(0).max(2000),
  from_three_eur: z.coerce.number().min(0).max(1000),
  deposit_eur: z.coerce.number().min(0).max(5000),
});

export const accessoryPricingSchema = z.object({
  id: z.string().uuid(),
  label: z.string().trim().min(2).max(60),
  price_eur: z.coerce.number().min(0).max(500),
});

export const accessoryStockSchema = z.object({
  accommodation_id: z.string().uuid(),
});

export const maxDepositSchema = z.object({ max_deposit_eur: z.coerce.number().min(0).max(20000) });

/** Statuts modifiables à la main : « réservé » et « en location » sont gérés par le système. */
export const MANUAL_BIKE_STATUSES = ["available", "unavailable", "maintenance", "pending_check", "stolen", "retired"] as const;

export const bikeUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(MANUAL_BIKE_STATUSES),
  frame_size: z.string().trim().max(20).optional(),
  accommodation_id: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional(),
});

export const partnerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(12).max(100),
  accommodation_id: z.string().uuid(),
});

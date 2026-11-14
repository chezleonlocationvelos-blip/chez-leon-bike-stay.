import { z } from "zod";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const periodSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("half_day"), date: dateStr, slot: z.string().min(1).max(30) }),
  z.object({ mode: z.literal("days"), start_date: dateStr, end_date: dateStr }),
]);

export const customerSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z.string().trim().min(6).max(30),
  accept_terms: z.literal("on"),
});

export const MAX_PER_TYPE = 10;
export const MAX_PANNIERS = 20;

export function parseQuantity(raw: FormDataEntryValue | null, max: number): number {
  const n = Number(raw ?? 0);
  if (!Number.isInteger(n) || n < 0 || n > max) throw new Error("INVALID_QUANTITY");
  return n;
}

import { DEFAULT_DAY, DEFAULT_SLOTS, daysRange, halfDayRange, type HalfDaySlot } from "./slots";
import type { Duration } from "@/lib/pricing";

export type PeriodInput =
  | { mode: "half_day"; date: string; slot: string }
  | { mode: "days"; start_date: string; end_date: string };

export const MAX_DAYS = 30;
/** Le créneau doit encore durer au moins ce temps pour être réservable (laisse le temps de payer et de partir). */
export const MIN_REMAINING_MS = 30 * 60 * 1000;

export type ResolvedPeriod = { start: Date; end: Date; billedDays: number; duration: Duration };

export function resolvePeriod(
  input: PeriodInput,
  now: Date = new Date(),
  slots: HalfDaySlot[] = DEFAULT_SLOTS,
  day = DEFAULT_DAY,
): ResolvedPeriod {
  let resolved: ResolvedPeriod;
  if (input.mode === "half_day") {
    const r = halfDayRange(input.date, input.slot, slots);
    resolved = { ...r, billedDays: 1, duration: { kind: "half_day" } };
  } else {
    const r = daysRange(input.start_date, input.end_date, day);
    if (r.billedDays > MAX_DAYS) throw new Error("TOO_LONG");
    resolved = { start: r.start, end: r.end, billedDays: r.billedDays, duration: { kind: "days", days: r.billedDays } };
  }
  // Réservation le jour même autorisée, tant que la plage n'est pas (quasi) terminée.
  if (resolved.end.getTime() <= now.getTime() + MIN_REMAINING_MS) throw new Error("PAST");
  return resolved;
}

/** Calcul des plages de location en heure de Paris, converties en UTC (gestion de l'heure d'été). */

export type HalfDaySlot = { id: string; start: string; end: string }; // "HH:MM"
export const DEFAULT_SLOTS: HalfDaySlot[] = [
  { id: "morning", start: "09:00", end: "13:00" },
  { id: "afternoon", start: "14:30", end: "18:30" },
];
export const DEFAULT_DAY = { pickup_time: "09:00", return_time: "18:30" };
const TZ = "Europe/Paris";

/** Décalage (ms) de Paris par rapport à UTC à un instant donné. */
function parisOffsetMs(utc: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(utc);
  const g = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second")) - utc.getTime();
}

/** "2027-07-14" + "09:00" (heure de Paris) → instant UTC. */
export function parisToUtc(date: string, time: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error("Date ou heure invalide");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = guess - parisOffsetMs(new Date(guess));
  return new Date(guess - parisOffsetMs(new Date(first)));
}

export function halfDayRange(date: string, slotId: string, slots: HalfDaySlot[] = DEFAULT_SLOTS) {
  const slot = slots.find((s) => s.id === slotId);
  if (!slot) throw new Error("Créneau inconnu");
  return { start: parisToUtc(date, slot.start), end: parisToUtc(date, slot.end) };
}

/** Location de plusieurs jours : de l'heure de retrait le 1er jour à l'heure de retour le dernier jour (inclus). */
export function daysRange(startDate: string, endDate: string, day = DEFAULT_DAY) {
  if (endDate < startDate) throw new Error("La date de fin précède la date de début");
  const start = parisToUtc(startDate, day.pickup_time);
  const end = parisToUtc(endDate, day.return_time);
  const billedDays = Math.round((Date.UTC(...ymd(endDate)) - Date.UTC(...ymd(startDate))) / 86_400_000) + 1;
  return { start, end, billedDays };
}

function ymd(s: string): [number, number, number] {
  const [y, m, d] = s.split("-").map(Number);
  return [y, m - 1, d];
}

/** Deux plages se chevauchent-elles ? (bornes semi-ouvertes : une fin = un début n'est pas un conflit). */
export function overlaps(a: { start: Date; end: Date }, b: { start: Date; end: Date }): boolean {
  return a.start < b.end && b.start < a.end;
}

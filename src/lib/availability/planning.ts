/** Calculs purs du planning de stock (testables sans base). */

const parisDay = (d: Date) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(d);

/** Lit une plage Postgres tstzrange renvoyée en texte : ["2026-11-25 08:00:00+00","2026-11-25 17:30:00+00"). */
export function parseRange(range: string): { start: Date; end: Date } | null {
  const m = range.match(/^[[(]"?([^",]+)"?,"?([^",)\]]+)"?[)\]]$/);
  if (!m) return null;
  // Postgres écrit le fuseau « +00 » ; JavaScript attend « +00:00 ».
  const iso = (t: string) => t.trim().replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
  const start = new Date(iso(m[1]));
  const end = new Date(iso(m[2]));
  return isNaN(start.getTime()) || isNaN(end.getTime()) ? null : { start, end };
}

/** Jours (AAAA-MM-JJ, heure de Paris) couverts par une période dont la fin est exclue. */
export function daysCovered(start: Date, end: Date): { from: string; to: string } {
  return { from: parisDay(start), to: parisDay(new Date(end.getTime() - 1)) };
}

/** Liste de n jours consécutifs à partir de AAAA-MM-JJ. */
export function nextDays(from: string, n: number): string[] {
  const [y, m, d] = from.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10));
}

export const BOOKABLE_STATUSES = new Set(["available", "reserved", "rented"]);

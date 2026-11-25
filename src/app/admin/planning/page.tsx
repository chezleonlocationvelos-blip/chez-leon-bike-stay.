import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { todayParis } from "@/lib/format";
import { bikeStatusLabels } from "@/lib/labels";
import { BOOKABLE_STATUSES, daysCovered, nextDays, parseRange } from "@/lib/availability/planning";

export const dynamic = "force-dynamic";
const DAYS = 14;

type Bike = { id: string; internal_code: string; status: string; frame_size: string | null; bike_types: { label: string } | null };
type Assignment = { bike_id: string; period: string; reservations: { id: string; number: string; status: string; customers: { last_name: string | null; first_name: string } | null } | null };

const dayLabel = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

/** Planning du stock : chaque vélo d'un point de location, jour par jour, avec les réservations qui l'occupent. */
export default async function PlanningPage({ searchParams }: { searchParams: Promise<{ acc?: string; from?: string }> }) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: accs } = await supabase.from("accommodations").select("id, name, mode").order("name");
  const list = (accs ?? []) as { id: string; name: string; mode: string }[];
  const acc = list.find((a) => a.id === sp.acc) ?? list.find((a) => a.mode === "counter") ?? list[0];
  if (!acc) return <p>Aucun point de location.</p>;

  const from = /^\d{4}-\d{2}-\d{2}$/.test(sp.from ?? "") ? sp.from! : todayParis();
  const days = nextDays(from, DAYS);
  const prevFrom = new Date(Date.parse(`${from}T12:00:00Z`) - DAYS * 86400_000).toISOString().slice(0, 10);
  const nextFrom = nextDays(from, DAYS + 1)[DAYS];

  const { data: bikeRows } = await supabase.from("bikes")
    .select("id, internal_code, status, frame_size, bike_types(label)")
    .eq("accommodation_id", acc.id).not("status", "in", "(retired,stolen)").order("internal_code");
  const bikes = (bikeRows ?? []) as unknown as Bike[];

  const { data: asg } = bikes.length
    ? await supabase.from("reservation_bike_assignments")
        .select("bike_id, period, reservations(id, number, status, customers(first_name, last_name))")
        .eq("active", true).in("bike_id", bikes.map((b) => b.id))
    : { data: [] };

  // Occupation : vélo → jour → réservation
  const occ = new Map<string, Map<string, NonNullable<Assignment["reservations"]>>>();
  for (const a of (asg ?? []) as unknown as Assignment[]) {
    const r = parseRange(a.period);
    if (!r || !a.reservations || a.reservations.status === "cancelled") continue;
    const { from: d1, to: d2 } = daysCovered(r.start, r.end);
    for (const d of days) if (d >= d1 && d <= d2) {
      if (!occ.has(a.bike_id)) occ.set(a.bike_id, new Map());
      occ.get(a.bike_id)!.set(d, a.reservations);
    }
  }

  // Un groupe par type et par taille : « Vélo classique · M ».
  const group = (b: Bike) => `${b.bike_types?.label ?? "Autre"}${b.frame_size ? ` · ${b.frame_size}` : ""}`;
  const types = [...new Set(bikes.map(group))];
  const freeCount = (type: string, d: string) =>
    bikes.filter((b) => group(b) === type && BOOKABLE_STATUSES.has(b.status) && !occ.get(b.id)?.has(d)).length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-forest">Planning du stock</h1>
          <p className="text-sm text-charcoal/80">{acc.name} · {bikes.length} vélo(s) · du {dayLabel(days[0])} au {dayLabel(days[DAYS - 1])}</p>
        </div>
        <form className="flex flex-wrap items-center gap-2">
          <select name="acc" defaultValue={acc.id} className="min-h-10 rounded-xl2 border border-line bg-white px-3">
            {list.map((a) => <option key={a.id} value={a.id}>{a.mode === "counter" ? `🏪 ${a.name}` : a.name}</option>)}
          </select>
          <input type="date" name="from" defaultValue={from} className="min-h-10 rounded-xl2 border border-line bg-white px-3" />
          <button className="min-h-10 rounded-xl2 bg-forest px-4 text-white">Afficher</button>
        </form>
      </div>
      <div className="flex gap-3 text-sm">
        <Link className="underline" href={`/admin/planning?acc=${acc.id}&from=${prevFrom}`}>← 2 semaines avant</Link>
        <Link className="underline" href={`/admin/planning?acc=${acc.id}`}>Aujourd'hui</Link>
        <Link className="underline" href={`/admin/planning?acc=${acc.id}&from=${nextFrom}`}>2 semaines après →</Link>
      </div>

      {bikes.length === 0 ? (
        <p className="rounded-xl2 bg-white p-4">Aucun vélo rattaché à ce point de location. Ajoutez-les dans <Link className="underline" href="/admin/bikes">Vélos</Link> en choisissant ce point de location.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl2 bg-white">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-sage/20">
                <th scope="col" className="sticky left-0 z-10 bg-[#eef1e8] px-3 py-2 text-left">Vélo</th>
                {days.map((d) => <th key={d} scope="col" className="whitespace-nowrap px-2 py-2 font-medium">{dayLabel(d)}</th>)}
              </tr>
            </thead>
            {types.map((type) => (
              <tbody key={type}>
                <tr className="border-t-2 border-sage/40 bg-accent/30">
                  <th scope="row" className="sticky left-0 z-10 bg-[#f6efe2] px-3 py-2 text-left">{type} · libres</th>
                  {days.map((d) => {
                    const n = freeCount(type, d);
                    return <td key={d} className={`px-2 py-2 text-center text-sm font-bold ${n === 0 ? "text-red-700" : "text-forest"}`}>{n}</td>;
                  })}
                </tr>
                {bikes.filter((b) => group(b) === type).map((b) => (
                  <tr key={b.id} className="border-t border-sage/20">
                    <th scope="row" className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-normal">
                      <Link className="underline" href={`/admin/bikes/${b.id}`}>{b.internal_code}</Link>
                      {!BOOKABLE_STATUSES.has(b.status) && <span className="ml-1 rounded bg-red-50 px-1 text-red-800">{bikeStatusLabels[b.status] ?? b.status}</span>}
                    </th>
                    {days.map((d) => {
                      const r = occ.get(b.id)?.get(d);
                      if (!r) return <td key={d} className="px-1 py-1" />;
                      const pending = r.status === "pending_payment";
                      return (
                        <td key={d} className="px-1 py-1">
                          <Link href={`/admin/reservations/${r.id}`} title={`${r.number} · ${r.customers?.first_name ?? ""} ${r.customers?.last_name ?? ""}`}
                            className={`block truncate rounded px-1 py-1 text-center ${pending ? "border border-dashed border-forest/50 text-forest" : "bg-sage text-white"}`}>
                            {r.customers?.last_name ?? r.number}
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      )}
      <p className="text-xs text-charcoal/70">
        Case verte : réservation payée. Case en pointillés : paiement en cours (vélo bloqué quelques minutes). Un vélo « En attente de contrôle » ou « En maintenance » n'est pas proposé à la réservation tant que vous ne le remettez pas en « Disponible ».
      </p>
    </section>
  );
}

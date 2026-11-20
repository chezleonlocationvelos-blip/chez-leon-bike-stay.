import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { bikeStatusLabels } from "@/lib/labels";

type Assignment = {
  active: boolean;
  reservations: { number: string; start_at: string; end_at: string; status: string } | null;
};
type Row = {
  id: string; internal_code: string; status: string; bike_type_id: string; accommodation_id: string | null;
  bike_types: { label: string } | null;
  accommodations: { name: string } | null;
  reservation_bike_assignments: Assignment[];
};
type Params = { type?: string; hebergement?: string; statut?: string; du?: string; au?: string; tri?: string; sens?: string };

const dayParis = (d: string | Date) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(new Date(d));
const shortDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "short", year: "numeric" });
const isDay = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

const statusStyle: Record<string, string> = {
  available: "bg-green-100 text-green-900",
  reserved: "bg-amber-100 text-amber-900",
  rented: "bg-sky-100 text-sky-900",
  pending_check: "bg-amber-100 text-amber-900",
  maintenance: "bg-orange-100 text-orange-900",
  unavailable: "bg-gray-200 text-gray-800",
  stolen: "bg-red-100 text-red-900",
  retired: "bg-gray-200 text-gray-800",
};

const SORTS = ["code", "type", "hebergement", "statut", "location"] as const;
type Sort = (typeof SORTS)[number];

export default async function BikesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const t = getMessages().bikes;
  const p = await searchParams;
  const supabase = await createSupabaseServerClient();

  const [bikesRes, typesRes, accRes] = await Promise.all([
    supabase
      .from("bikes")
      .select(
        "id, internal_code, status, bike_type_id, accommodation_id, bike_types(label), accommodations(name), reservation_bike_assignments(active, reservations(number, start_at, end_at, status))",
      )
      .order("internal_code"),
    supabase.from("bike_types").select("id, label").order("label"),
    supabase.from("accommodations").select("id, name").order("name"),
  ]);
  if (bikesRes.error) throw new Error("Impossible de charger les vélos.");
  const all = (bikesRes.data ?? []) as unknown as Row[];
  const types = (typesRes.data ?? []) as { id: string; label: string }[];
  const accs = (accRes.data ?? []) as { id: string; name: string }[];

  const from = isDay(p.du) ? p.du! : "";
  const to = isDay(p.au) ? p.au! : "";
  const sort: Sort = (SORTS as readonly string[]).includes(p.tri ?? "") ? (p.tri as Sort) : "code";
  const dir = p.sens === "desc" ? "desc" : "asc";
  const today = dayParis(new Date());

  // Pour chaque vélo : locations actives, prochaine/en cours, dernière terminée, locations sur la période.
  const info = (b: Row) => {
    const act = b.reservation_bike_assignments
      .filter((a) => a.active && a.reservations && a.reservations.status !== "cancelled")
      .map((a) => a.reservations!);
    const upcoming = act
      .filter((r) => dayParis(r.end_at) >= today)
      .sort((x, y) => x.start_at.localeCompare(y.start_at))[0];
    const last = act
      .filter((r) => dayParis(r.end_at) < today)
      .sort((x, y) => y.end_at.localeCompare(x.end_at))[0];
    const inRange = act.filter((r) => (!from || dayParis(r.end_at) >= from) && (!to || dayParis(r.start_at) <= to));
    return { upcoming, last, inRange };
  };

  let rows = all.filter((b) => {
    if (p.type && b.bike_type_id !== p.type) return false;
    if (p.hebergement === "none" ? b.accommodation_id !== null : p.hebergement && b.accommodation_id !== p.hebergement) return false;
    if (p.statut && b.status !== p.statut) return false;
    if ((from || to) && info(b).inRange.length === 0) return false;
    return true;
  });

  const key = (b: Row): string => {
    switch (sort) {
      case "type": return b.bike_types?.label ?? "";
      case "hebergement": return b.accommodations?.name ?? "";
      case "statut": return bikeStatusLabels[b.status] ?? b.status;
      case "location": {
        const i = info(b);
        return i.upcoming?.start_at ?? i.last?.end_at ?? "";
      }
      default: return b.internal_code;
    }
  };
  rows = [...rows].sort((a, b) => key(a).localeCompare(key(b), "fr", { numeric: true }) * (dir === "desc" ? -1 : 1));

  const filtersOn = !!(p.type || p.hebergement || p.statut || from || to);
  const qs = (over: Partial<Params>) => {
    const q = new URLSearchParams();
    const merged: Params = { type: p.type, hebergement: p.hebergement, statut: p.statut, du: from, au: to, tri: p.tri, sens: p.sens, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    const s = q.toString();
    return s ? `?${s}` : "";
  };
  const sortLink = (col: Sort) => qs({ tri: col, sens: sort === col && dir === "asc" ? "desc" : "asc" });
  const arrow = (col: Sort) => (sort === col ? (dir === "asc" ? " ↑" : " ↓") : "");

  const field = "mt-1 w-full rounded-xl2 border border-line bg-white px-3 py-2 text-charcoal";
  const label = "block text-sm font-medium text-forest";

  const locationCell = (b: Row) => {
    const i = info(b);
    if (from || to) {
      const n = i.inRange.length;
      const first = i.inRange.sort((x, y) => x.start_at.localeCompare(y.start_at))[0];
      return (
        <>
          <span className="font-medium">{n} location{n > 1 ? "s" : ""}</span>
          <span className="block text-sm text-charcoal/70">{shortDate(first.start_at)} → {shortDate(first.end_at)}</span>
        </>
      );
    }
    if (i.upcoming) {
      const now = dayParis(i.upcoming.start_at) <= today;
      return (
        <>
          <span className="font-medium">{now ? "En cours" : "Prochaine"}</span>
          <span className="block text-sm text-charcoal/70">{shortDate(i.upcoming.start_at)} → {shortDate(i.upcoming.end_at)}</span>
        </>
      );
    }
    if (i.last) {
      return (
        <>
          <span className="font-medium">Dernière</span>
          <span className="block text-sm text-charcoal/70">{shortDate(i.last.start_at)} → {shortDate(i.last.end_at)}</span>
        </>
      );
    }
    return <span className="text-charcoal/60">Jamais louée</span>;
  };

  const Pill = ({ s }: { s: string }) => (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${statusStyle[s] ?? "bg-gray-100 text-gray-800"}`}>
      {bikeStatusLabels[s] ?? s}
    </span>
  );

  const heads: { col: Sort; text: string }[] = [
    { col: "code", text: t.code },
    { col: "type", text: t.type },
    { col: "hebergement", text: t.accommodation },
    { col: "statut", text: t.status },
    { col: "location", text: from || to ? "Locations sur la période" : "Location" },
  ];

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-forest">{t.title}</h1>
        <Link href="/admin/bikes/new" className="rounded-xl2 bg-forest px-5 py-3 text-white">Ajouter</Link>
      </div>

      <form method="get" className="mb-4 rounded-xl2 border border-line bg-white p-4" aria-label="Filtres des vélos">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="f-type" className={label}>Type de vélo</label>
            <select id="f-type" name="type" defaultValue={p.type ?? ""} className={field}>
              <option value="">Tous les types</option>
              {types.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-heb" className={label}>Hébergement</label>
            <select id="f-heb" name="hebergement" defaultValue={p.hebergement ?? ""} className={field}>
              <option value="">Tous les hébergements</option>
              <option value="none">{t.unassigned}</option>
              {accs.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-statut" className={label}>Statut</label>
            <select id="f-statut" name="statut" defaultValue={p.statut ?? ""} className={field}>
              <option value="">Tous les statuts</option>
              {Object.entries(bikeStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-du" className={label}>Loué à partir du</label>
            <input id="f-du" type="date" name="du" defaultValue={from} className={field} />
          </div>
          <div>
            <label htmlFor="f-au" className={label}>Loué jusqu&apos;au</label>
            <input id="f-au" type="date" name="au" defaultValue={to} className={field} />
          </div>
          <div className="flex items-end gap-3">
            <button type="submit" className="rounded-xl2 bg-forest px-5 py-2 text-white">Filtrer</button>
            {filtersOn && <Link href="/admin/bikes" className="px-2 py-2 underline">Réinitialiser</Link>}
          </div>
        </div>
        {p.tri && <input type="hidden" name="tri" value={sort} />}
        {p.sens && <input type="hidden" name="sens" value={dir} />}
        <p className="mt-3 text-sm text-charcoal/70">
          Les dates affichent les vélos loués au moins un jour sur la période. Renseigne une seule date pour « à partir de » ou « jusqu&apos;à ».
        </p>
      </form>

      <p className="mb-3 text-charcoal" role="status">
        <strong>{rows.length}</strong> vélo{rows.length > 1 ? "s" : ""} sur {all.length}
        {filtersOn ? " (filtres actifs)" : ""}
      </p>

      {rows.length === 0 ? (
        <p className="rounded-xl2 bg-white p-6">{filtersOn ? "Aucun vélo ne correspond à ces filtres." : t.empty}</p>
      ) : (
        <>
          {/* Tableau : écrans larges */}
          <div className="hidden overflow-x-auto rounded-xl2 bg-white md:block">
            <table className="w-full text-left">
              <thead className="bg-sage/20">
                <tr>
                  {heads.map((h) => (
                    <th key={h.col} scope="col" className="px-4 py-3" aria-sort={sort === h.col ? (dir === "asc" ? "ascending" : "descending") : "none"}>
                      <Link href={sortLink(h.col)} className="underline-offset-2 hover:underline">{h.text}{arrow(h.col)}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id} className="border-t border-sage/30 align-top">
                    <td className="px-4 py-3 font-medium"><Link className="underline" href={`/admin/bikes/${b.id}`}>{b.internal_code}</Link></td>
                    <td className="px-4 py-3">{b.bike_types?.label}</td>
                    <td className="px-4 py-3">{b.accommodations?.name ?? t.unassigned}</td>
                    <td className="px-4 py-3"><Pill s={b.status} /></td>
                    <td className="px-4 py-3">{locationCell(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartes : mobile */}
          <ul className="space-y-3 md:hidden">
            {rows.map((b) => (
              <li key={b.id} className="rounded-xl2 border border-line bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <Link className="text-lg font-bold text-forest underline" href={`/admin/bikes/${b.id}`}>{b.internal_code}</Link>
                  <Pill s={b.status} />
                </div>
                <p className="mt-1">{b.bike_types?.label} · {b.accommodations?.name ?? t.unassigned}</p>
                <p className="mt-2 text-sm">{locationCell(b)}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

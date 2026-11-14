import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getMessages } from "@/i18n";

type Row = {
  id: string; internal_code: string; status: string;
  bike_types: { label: string } | null;
  accommodations: { name: string } | null;
};

export default async function BikesPage() {
  const t = getMessages().bikes;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bikes")
    .select("id, internal_code, status, bike_types(label), accommodations(name)")
    .order("internal_code");
  if (error) throw new Error("Impossible de charger les vélos.");
  const rows = (data ?? []) as unknown as Row[];

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-forest">{t.title}</h1>
        <Link href="/admin/bikes/new" className="rounded-xl2 bg-forest px-5 py-3 text-white">Ajouter</Link>
      </div>
      {rows.length === 0 ? (
        <p>{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl2 bg-white">
          <table className="w-full text-left">
            <thead className="bg-sage/20">
              <tr>
                {[t.code, t.type, t.accommodation, t.status].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-t border-sage/30">
                  <td className="px-4 py-3 font-medium"><Link className="underline" href={`/admin/bikes/${b.id}`}>{b.internal_code}</Link></td>
                  <td className="px-4 py-3">{b.bike_types?.label}</td>
                  <td className="px-4 py-3">{b.accommodations?.name ?? t.unassigned}</td>
                  <td className="px-4 py-3">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

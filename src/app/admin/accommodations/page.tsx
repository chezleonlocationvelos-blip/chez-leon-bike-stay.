import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getMessages } from "@/i18n";

type Row = {
  id: string; slug: string; name: string; city: string | null;
  commission_bps: number; is_active: boolean; mode: string; bikes: { count: number }[];
};

export default async function AccommodationsPage() {
  const t = getMessages().accommodations;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("accommodations")
    .select("id, slug, name, city, commission_bps, is_active, mode, bikes(count)")
    .order("name");
  if (error) throw new Error("Impossible de charger les hébergements.");
  const rows = (data ?? []) as Row[];

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-forest">{t.title}</h1>
        <Link href="/admin/accommodations/new" className="rounded-xl2 bg-forest px-5 py-3 text-white">Ajouter</Link>
      </div>
      {rows.length === 0 ? (
        <p>{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl2 bg-white">
          <table className="w-full text-left">
            <thead className="bg-sage/20">
              <tr>
                {[t.name, t.city, t.commission, t.bikes, t.status, t.link].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-t border-sage/30">
                  <td className="px-4 py-3 font-medium"><Link className="underline" href={`/admin/accommodations/${a.id}`}>{a.name}</Link></td>
                  <td className="px-4 py-3">{a.city}</td>
                  <td className="px-4 py-3">{a.mode === "counter" ? "Boutique" : `${(a.commission_bps / 100).toLocaleString("fr-FR")} %`}</td>
                  <td className="px-4 py-3">{a.bikes?.[0]?.count ?? 0}</td>
                  <td className="px-4 py-3">{a.is_active ? t.active : t.inactive}</td>
                  <td className="px-4 py-3"><code>/h/{a.slug}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

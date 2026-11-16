import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { ACCOMMODATION_PHOTOS } from "@/lib/photos";
import { PartnersMap, type MapPoint } from "./PartnersMap";

type Acc = { id: string; slug: string; name: string; type: string; city: string | null; latitude: number | null; longitude: number | null };

/** Hébergements partenaires actifs : carte + cartes de réservation, avec le nombre de vélos par type. */
export async function PartnersSection() {
  const db = createSupabaseServiceClient();
  const [{ data: accs }, { data: bikes }] = await Promise.all([
    db.from("accommodations").select("id, slug, name, type, city, latitude, longitude").eq("is_active", true).order("name"),
    db.from("bikes").select("accommodation_id, status, bike_types(code)").not("accommodation_id", "is", null).not("status", "in", "(retired,stolen)"),
  ]);
  const list = (accs ?? []) as unknown as Acc[];
  if (list.length === 0) return null;

  const counts = new Map<string, { electric: number; classic: number }>();
  for (const b of (bikes ?? []) as unknown as { accommodation_id: string; bike_types: { code: string } | null }[]) {
    const c = counts.get(b.accommodation_id) ?? { electric: 0, classic: 0 };
    if (b.bike_types?.code === "electric") c.electric += 1;
    if (b.bike_types?.code === "classic") c.classic += 1;
    counts.set(b.accommodation_id, c);
  }
  const points: MapPoint[] = list
    .filter((a) => a.latitude != null && a.longitude != null)
    .map((a) => ({ slug: a.slug, name: a.name, city: a.city, lat: Number(a.latitude), lng: Number(a.longitude) }));

  return (
    <section>
      <h2 className="mb-3 font-display text-4xl font-bold text-forest">Où louer un vélo</h2>
      <p className="mb-3 text-sm">Choisissez un hébergement partenaire pour réserver votre vélo en quelques minutes.</p>
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      {points.length > 0 && <div className="lg:sticky lg:top-6"><PartnersMap points={points} /></div>}
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:mt-0 lg:grid-cols-1">
        {list.map((a) => {
          const c = counts.get(a.id) ?? { electric: 0, classic: 0 };
          const photo = ACCOMMODATION_PHOTOS[a.slug];
          return (
            <li key={a.id}>
              <a href={`/h/${a.slug}`} className="block overflow-hidden rounded-xl2 border border-line bg-white transition hover:shadow-md">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={a.name} className="h-40 w-full object-cover" />
                ) : (
                  <div aria-hidden="true" className="flex h-24 items-center justify-center bg-sage/30 font-display text-3xl font-bold text-forest">{a.city ?? a.name}</div>
                )}
                <div className="p-4">
                  <p className="font-bold text-forest">{a.name}</p>
                  <p className="text-sm">{a.type}{a.city ? ` · ${a.city}` : ""}</p>
                  <p className="mt-1 text-sm">
                    {[c.electric > 0 && `${c.electric} vélo${c.electric > 1 ? "s" : ""} électrique${c.electric > 1 ? "s" : ""}`,
                      c.classic > 0 && `${c.classic} classique${c.classic > 1 ? "s" : ""}`].filter(Boolean).join(" · ") || "Vélos bientôt disponibles"}
                  </p>
                  <p className="mt-2 text-sm font-bold underline">Réserver un vélo</p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
      </div>
    </section>
  );
}

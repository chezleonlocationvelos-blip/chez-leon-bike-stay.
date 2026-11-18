import { createSupabaseServiceClient } from "@/lib/supabase/admin";

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);
const date = (d: string) => new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "Europe/Paris" }).format(new Date(d));

/** Avis réels (réservations terminées, modérés) d'un hébergement. N'affiche rien tant qu'il n'y en a pas. */
export async function AccommodationReviews({ accommodationId }: { accommodationId: string }) {
  const db = createSupabaseServiceClient();
  const { data } = await db.from("reviews").select("id, rating, comment, display_name, created_at")
    .eq("accommodation_id", accommodationId).eq("status", "published").order("created_at", { ascending: false }).limit(12);
  const list = data ?? [];
  if (list.length === 0) return null;
  const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-4xl font-bold text-forest">Avis des voyageurs</h2>
        <p className="text-sm text-forest"><span aria-hidden="true">★</span> {avg.toFixed(1).replace(".", ",")} sur 5 · {list.length} avis</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {list.map((r) => (
          <figure key={r.id} className="flex flex-col gap-2 rounded-xl2 border border-line bg-white p-4">
            <div aria-label={`${r.rating} étoiles sur 5`} className="text-sage">{stars(r.rating)}</div>
            {r.comment && <blockquote className="text-sm text-charcoal">{r.comment}</blockquote>}
            <figcaption className="mt-auto text-sm font-bold text-forest">
              {r.display_name} <span className="font-normal text-charcoal/70">· {date(r.created_at)}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/Button";
import { setReviewStatus } from "./actions";

export const metadata = { title: "Avis clients – Administration" };
const LABEL: Record<string, string> = { pending: "À relire", published: "Publié", hidden: "Masqué" };

export default async function AdminReviews() {
  const db = createSupabaseServiceClient();
  const { data } = await db.from("reviews")
    .select("id, rating, comment, display_name, status, created_at, accommodations(name), reservations(number)")
    .order("created_at", { ascending: false }).limit(100);
  const list = (data ?? []) as unknown as {
    id: string; rating: number; comment: string | null; display_name: string; status: string; created_at: string;
    accommodations: { name: string }; reservations: { number: string };
  }[];

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-5xl font-bold text-forest">Avis clients</h1>
      <p className="text-sm text-charcoal">
        Les avis arrivent « à relire ». Publiez-les tous, bons ou moins bons : ne masquez que les avis hors sujet ou injurieux.
      </p>
      {list.length === 0 && <p>Aucun avis pour l'instant. La demande part automatiquement 24 h après la restitution des vélos.</p>}
      <ul className="flex flex-col gap-3">
        {list.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 rounded-xl2 border border-line bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span><strong>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</strong> · {r.display_name} · {r.accommodations.name} · {r.reservations.number}</span>
              <span className="rounded-xl2 bg-accent px-2 py-1 text-forest">{LABEL[r.status] ?? r.status}</span>
            </div>
            {r.comment && <p>{r.comment}</p>}
            <div className="flex gap-2">
              {r.status !== "published" && (
                <form action={setReviewStatus.bind(null, r.id, "published")}><Button type="submit">Publier</Button></form>
              )}
              {r.status !== "hidden" && (
                <form action={setReviewStatus.bind(null, r.id, "hidden")}><Button type="submit" variant="secondary">Masquer</Button></form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

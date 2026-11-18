import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/Button";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/reservations/token";
import { submitReview } from "./actions";

export const metadata = { title: "Votre avis – Chez Léon", robots: { index: false, follow: false } };

export default async function ReviewPage({
  params, searchParams,
}: { params: Promise<{ token: string }>; searchParams: Promise<{ merci?: string; error?: string }> }) {
  const { token } = await params;
  const { merci, error } = await searchParams;
  const db = createSupabaseServiceClient();
  const { data: r } = await db.from("reservations")
    .select("id, status, is_demo, accommodations(name), customers(first_name, last_name)")
    .eq("access_token_hash", hashToken(token)).maybeSingle();
  if (!r || r.is_demo) notFound();
  const acc = r.accommodations as unknown as { name: string };
  const cust = r.customers as unknown as { first_name: string; last_name: string | null };
  const { data: existing } = await db.from("reviews").select("id").eq("reservation_id", r.id).maybeSingle();
  const defaultName = `${cust.first_name}${cust.last_name ? ` ${cust.last_name.charAt(0).toUpperCase()}.` : ""}`;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-col gap-5 p-6">
        {merci || existing ? (
          <>
            <h1 className="text-5xl font-bold text-forest">Merci !</h1>
            <p>Votre avis a bien été reçu. Il sera publié sur la page de l'hébergement après une relecture rapide.</p>
          </>
        ) : r.status !== "completed" ? (
          <>
            <h1 className="text-5xl font-bold text-forest">Votre avis</h1>
            <p>Vous pourrez donner votre avis une fois votre location terminée et les vélos restitués.</p>
          </>
        ) : (
          <>
            <h1 className="text-5xl font-bold text-forest">Votre sortie à vélo</h1>
            <p className="text-charcoal">{acc.name}. Une note, et quelques mots si vous le souhaitez.</p>
            {error && <p role="alert" className="rounded-xl2 bg-red-50 p-3 text-red-800">Impossible d'enregistrer votre avis. Vérifiez la note et votre nom, puis réessayez.</p>}
            <form action={submitReview.bind(null, token)} className="flex flex-col gap-4">
              <StarRating />
              <label className="flex flex-col gap-1 text-sm">Votre commentaire (facultatif)
                <textarea name="comment" rows={5} maxLength={1000} className="rounded-xl2 border border-line bg-white p-3" placeholder="Ce que vous avez aimé, ce qu'on peut améliorer…" />
              </label>
              <label className="flex flex-col gap-1 text-sm">Nom affiché avec votre avis
                <input name="display_name" required maxLength={60} defaultValue={defaultName} className="min-h-12 rounded-xl2 border border-line bg-white px-4" />
              </label>
              <Button type="submit">Envoyer mon avis</Button>
              <p className="text-xs text-charcoal/80">Tous les avis sont publiés, bons ou moins bons, sauf s'ils sont hors sujet ou injurieux.</p>
            </form>
          </>
        )}
      </main>
    </>
  );
}

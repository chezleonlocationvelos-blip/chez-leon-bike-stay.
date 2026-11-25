import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AccommodationForm } from "@/components/admin/AccommodationForm";
import { saveAccessoryStock } from "../actions";
import { startStripeOnboarding } from "./stripe/actions";
import { Button } from "@/components/ui/Button";
import { isStripeConfigured } from "@/lib/stripe/client";

export default async function EditAccommodation({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; stock?: string }> }) {
  const { id } = await params;
  const { error, stock: stockSaved } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("accommodations").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const [{ data: paid }, { data: stock }] = await Promise.all([
    supabase.from("accessories").select("id, label, is_enabled, daily_price_cents").eq("is_included", false).order("label"),
    supabase.from("accommodation_accessories").select("accessory_id, stock").eq("accommodation_id", id),
  ]);
  const stockOf = (aid: string) => (stock ?? []).find((s) => s.accessory_id === aid)?.stock ?? 0;

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-forest">{data.name}</h1>
      <div className="flex flex-wrap items-center gap-3 rounded-xl2 bg-white p-4">
        <span>QR code :</span>
        <a className="underline" href={`/admin/accommodations/${id}/qr?format=png`}>PNG</a>
        <a className="underline" href={`/admin/accommodations/${id}/qr?format=svg`}>SVG</a>
        <a className="underline" href={`/admin/accommodations/${id}/qr?format=svg`} target="_blank" rel="noreferrer">Aperçu imprimable</a>
      </div>
      {data.mode === "counter" ? (
        <p className="rounded-xl2 bg-accent/40 p-4 text-sm">
          Boutique Chez Léon : retrait au comptoir, pas de commission ni de Stripe Connect. Lien de réservation à mettre sur chezleonlocation.com : <code>/reserver</code> (ou <code>/h/{data.slug}</code>).
        </p>
      ) : (
      <div className="flex flex-col gap-2 rounded-xl2 bg-white p-4">
        <h2 className="font-semibold">Versement de la commission (Stripe Connect)</h2>
        <p className="text-sm">
          {data.stripe_payouts_enabled ? "Compte Stripe actif : les commissions peuvent être versées."
            : data.stripe_account_id ? "Inscription Stripe commencée mais incomplète : l'hébergeur doit la terminer."
            : "Aucun compte Stripe : la commission ne peut pas être versée automatiquement."}
        </p>
        {isStripeConfigured() ? (
          <form action={startStripeOnboarding.bind(null, id)}>
            <Button type="submit" variant="secondary">{data.stripe_account_id ? "Reprendre l'inscription Stripe" : "Lancer l'inscription Stripe"}</Button>
          </form>
        ) : <p className="text-sm">Stripe n'est pas configuré (STRIPE_SECRET_KEY absente).</p>}
      </div>
      )}
      <form action={saveAccessoryStock} className="flex flex-col gap-3 rounded-xl2 bg-white p-4">
        <input type="hidden" name="accommodation_id" value={id} />
        <h2 className="font-semibold">Stock d'accessoires</h2>
        {stockSaved && <p role="status" className="rounded-xl2 bg-sage/30 p-2 text-sm">Stock enregistré.</p>}
        {error === "stock" && <p role="alert" className="rounded-xl2 bg-red-50 p-2 text-sm text-red-800">Stock invalide.</p>}
        <p className="text-sm text-charcoal/80">Nombre d'exemplaires disponibles ici. 0 = non proposé. Les accessoires réservés sur les mêmes dates sont déduits automatiquement.</p>
        <div className="flex flex-wrap gap-4">
          {(paid ?? []).map((a) => (
            <label key={a.id} className="flex flex-col gap-1 text-sm">
              {a.label}{!a.is_enabled && " (désactivé, voir Tarifs)"}
              <input name={`stock_${a.id}`} type="number" min="0" max="200" step="1" defaultValue={stockOf(a.id)} className="min-h-12 w-28 rounded-xl2 border border-line bg-white px-4" />
            </label>
          ))}
        </div>
        <Button type="submit" variant="secondary">Enregistrer le stock</Button>
      </form>
      <AccommodationForm values={data} error={error === "stock" ? undefined : error} />
    </section>
  );
}

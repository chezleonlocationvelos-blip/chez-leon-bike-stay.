import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateAccessory, updateBikeTypePricing, updateMaxDeposit } from "./actions";
import { Button } from "@/components/ui/Button";

const input = "min-h-12 w-32 rounded-xl2 border border-line bg-white px-4";

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const [{ data: types }, { data: setting }, { data: accessories }] = await Promise.all([
    supabase.from("bike_types").select("id, label, daily_price_cents, half_day_price_cents, two_days_price_cents, price_from_three_days_cents, deposit_cents, is_enabled").order("label"),
    supabase.from("application_settings").select("value").eq("key", "max_deposit_cents").maybeSingle(),
    supabase.from("accessories").select("id, code, label, daily_price_cents, is_enabled").eq("is_included", false).order("label"),
  ]);
  const maxDeposit = typeof setting?.value === "number" ? setting.value / 100 : "";

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-forest">Tarifs et cautions</h1>
      {saved && <p role="status" className="rounded-xl2 bg-sage/30 p-3">Modification enregistrée.</p>}
      {error && <p role="alert" className="rounded-xl2 bg-red-50 p-3 text-red-800">{error === "price_required" ? "Saisissez un prix avant de proposer ce vélo ou cet accessoire à la location." : "Valeurs invalides ou enregistrement impossible."}</p>}
      <p className="text-sm">
        Ces valeurs sont lues par le serveur lors du calcul d'une réservation. Une modification n'affecte pas les
        réservations déjà créées (leurs prix sont figés au moment de la réservation).
      </p>

      {(types ?? []).map((t) => (
        <form key={t.id} action={updateBikeTypePricing} className="flex flex-wrap items-end gap-4 rounded-xl2 bg-white p-4">
          <input type="hidden" name="id" value={t.id} />
          <div className="flex min-w-40 flex-col gap-1">
            <span className="font-medium">{t.label}</span>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_enabled" defaultChecked={t.is_enabled} className="h-5 w-5" /> Proposé à la location</label>
          </div>
          <label className="flex flex-col gap-1 text-sm">Demi-journée (€)
            <input name="half_day_eur" type="number" step="0.01" min="0" required defaultValue={t.half_day_price_cents / 100} className={input} /></label>
          <label className="flex flex-col gap-1 text-sm">1 jour (€)
            <input name="price_eur" type="number" step="0.01" min="0" required defaultValue={t.daily_price_cents / 100} className={input} /></label>
          <label className="flex flex-col gap-1 text-sm">Forfait 2 jours (€)
            <input name="two_days_eur" type="number" step="0.01" min="0" required defaultValue={t.two_days_price_cents / 100} className={input} /></label>
          <label className="flex flex-col gap-1 text-sm">Par jour dès 3 jours (€)
            <input name="from_three_eur" type="number" step="0.01" min="0" required defaultValue={t.price_from_three_days_cents / 100} className={input} /></label>
          <label className="flex flex-col gap-1 text-sm">Caution par vélo (€)
            <input name="deposit_eur" type="number" step="0.01" min="0" required defaultValue={t.deposit_cents / 100} className={input} /></label>
          <Button type="submit">Enregistrer</Button>
        </form>
      ))}

      <h2 className="mt-2 text-xl font-bold text-forest">Accessoires payants</h2>
      <p className="text-sm">
        Prix par jour (une demi-journée compte pour un jour). Un accessoire coché n'apparaît que sur les pages où vous avez saisi
        un stock (fiche de la boutique ou de l'hébergement, rubrique « Stock d'accessoires »). Casques et antivols restent inclus.
      </p>
      {(accessories ?? []).map((a) => (
        <form key={a.id} action={updateAccessory} className="flex flex-wrap items-end gap-4 rounded-xl2 bg-white p-4">
          <input type="hidden" name="id" value={a.id} />
          <label className="flex flex-col gap-1 text-sm">Nom affiché
            <input name="label" required defaultValue={a.label} className="min-h-12 w-56 rounded-xl2 border border-line bg-white px-4" /></label>
          <label className="flex flex-col gap-1 text-sm">Prix par jour (€)
            <input name="price_eur" type="number" step="0.01" min="0" required defaultValue={a.daily_price_cents / 100} className={input} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_enabled" defaultChecked={a.is_enabled} className="h-5 w-5" /> Proposé à la location</label>
          <Button type="submit">Enregistrer</Button>
        </form>
      ))}

      <form action={updateMaxDeposit} className="flex flex-wrap items-end gap-4 rounded-xl2 bg-white p-4">
        <div className="min-w-40 font-medium">Plafond de caution par réservation (optionnel)</div>
        <label className="flex flex-col gap-1 text-sm">Montant maximum (€)
          <input name="max_deposit_eur" type="number" step="1" min="0" placeholder="aucun" defaultValue={maxDeposit} className={input} /></label>
        <Button type="submit">Enregistrer</Button>
      </form>
    </section>
  );
}

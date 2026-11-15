import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateBikeTypePricing, updateMaxDeposit } from "./actions";
import { Button } from "@/components/ui/Button";

const input = "min-h-12 w-32 rounded-xl2 border border-line bg-white px-4";

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const [{ data: types }, { data: setting }] = await Promise.all([
    supabase.from("bike_types").select("id, label, daily_price_cents, half_day_price_cents, two_days_price_cents, price_from_three_days_cents, deposit_cents, is_enabled").order("label"),
    supabase.from("application_settings").select("value").eq("key", "max_deposit_cents").maybeSingle(),
  ]);
  const maxDeposit = typeof setting?.value === "number" ? setting.value / 100 : "";

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-forest">Tarifs et cautions</h1>
      {saved && <p role="status" className="rounded-xl2 bg-sage/30 p-3">Modification enregistrée.</p>}
      {error && <p role="alert" className="rounded-xl2 bg-red-50 p-3 text-red-800">Valeurs invalides ou enregistrement impossible.</p>}
      <p className="text-sm">
        Ces valeurs sont lues par le serveur lors du calcul d'une réservation. Une modification n'affecte pas les
        réservations déjà créées (leurs prix sont figés au moment de la réservation).
      </p>

      {(types ?? []).map((t) => (
        <form key={t.id} action={updateBikeTypePricing} className="flex flex-wrap items-end gap-4 rounded-xl2 bg-white p-4">
          <input type="hidden" name="id" value={t.id} />
          <div className="min-w-40 font-medium">{t.label}{!t.is_enabled && " (désactivé)"}</div>
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

      <form action={updateMaxDeposit} className="flex flex-wrap items-end gap-4 rounded-xl2 bg-white p-4">
        <div className="min-w-40 font-medium">Plafond de caution par réservation (optionnel)</div>
        <label className="flex flex-col gap-1 text-sm">Montant maximum (€)
          <input name="max_deposit_eur" type="number" step="1" min="0" placeholder="aucun" defaultValue={maxDeposit} className={input} /></label>
        <Button type="submit">Enregistrer</Button>
      </form>
    </section>
  );
}

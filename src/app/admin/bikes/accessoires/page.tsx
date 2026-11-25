import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BikesTabs } from "@/components/admin/BikesTabs";
import { Button } from "@/components/ui/Button";
import { saveShopAccessory } from "./actions";

const input = "min-h-12 rounded-xl2 border border-line bg-white px-4";
const errors: Record<string, string> = {
  price_required: "Saisissez un prix avant de proposer cet accessoire à la location.",
  validation: "Valeurs invalides.",
  save: "L'enregistrement a échoué.",
};

/** Accessoires de la boutique : prix, activation et stock, au même endroit que les vélos. */
export default async function AccessoriesPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const [{ data: shop }, { data: accessories }] = await Promise.all([
    supabase.from("accommodations").select("id, name").eq("mode", "counter").order("created_at").limit(1).maybeSingle(),
    supabase.from("accessories").select("id, code, label, daily_price_cents, is_enabled").eq("is_included", false).order("label"),
  ]);
  const { data: stock } = shop
    ? await supabase.from("accommodation_accessories").select("accessory_id, stock").eq("accommodation_id", shop.id)
    : { data: [] };
  const stockOf = (id: string) => (stock ?? []).find((s) => s.accessory_id === id)?.stock ?? 0;

  return (
    <section>
      <BikesTabs current="accessories" />
      <h1 className="text-2xl font-bold text-forest">Accessoires{shop ? ` · ${shop.name}` : ""}</h1>
      <p className="mb-4 mt-1 text-sm text-charcoal/80">
        Prix par jour (une demi-journée compte pour un jour). Un accessoire est proposé aux clients s'il a un prix, que la case est cochée
        et que le stock est d'au moins 1. Les accessoires déjà réservés sur les mêmes dates sont déduits automatiquement. Casques et antivols restent inclus.
      </p>
      {saved && <p role="status" className="mb-3 rounded-xl2 bg-sage/30 p-3">Accessoire enregistré.</p>}
      {error && <p role="alert" className="mb-3 rounded-xl2 bg-red-50 p-3 text-red-800">{errors[error] ?? errors.save}</p>}
      {!shop ? <p>Aucune boutique configurée.</p> : (
        <div className="flex flex-col gap-3">
          {(accessories ?? []).map((a) => {
            const live = a.is_enabled && a.daily_price_cents > 0 && stockOf(a.id) > 0;
            return (
              <form key={a.id} action={saveShopAccessory} className="flex flex-wrap items-end gap-4 rounded-xl2 bg-white p-4">
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="shop_id" value={shop.id} />
                <label className="flex flex-col gap-1 text-sm">Nom affiché
                  <input name="label" required defaultValue={a.label} className={`${input} w-56`} /></label>
                <label className="flex flex-col gap-1 text-sm">Prix par jour (€)
                  <input name="price_eur" type="number" step="0.01" min="0" required defaultValue={a.daily_price_cents / 100} className={`${input} w-28`} /></label>
                <label className="flex flex-col gap-1 text-sm">Stock en boutique
                  <input name="stock" type="number" step="1" min="0" max="200" required defaultValue={stockOf(a.id)} className={`${input} w-28`} /></label>
                <label className="flex min-h-12 items-center gap-2 text-sm"><input type="checkbox" name="is_enabled" defaultChecked={a.is_enabled} className="h-5 w-5" /> Proposé à la location</label>
                <Button type="submit">Enregistrer</Button>
                <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${live ? "bg-sage text-white" : "bg-line/60 text-charcoal"}`}>
                  {live ? "Visible par les clients" : "Non visible"}
                </span>
              </form>
            );
          })}
        </div>
      )}
    </section>
  );
}

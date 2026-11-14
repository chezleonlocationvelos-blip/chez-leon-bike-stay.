import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createBike } from "../actions";
import { Button } from "@/components/ui/Button";

const input = "min-h-12 rounded-xl2 border border-sage bg-white px-4";
const errors: Record<string, string> = {
  validation: "Champs invalides. Le code doit ressembler à ELEC-001 ou CLASS-001.",
  duplicate: "Ce code ou ce numéro de série existe déjà.",
  save: "L'enregistrement a échoué.",
};

export default async function NewBike({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const [{ data: types }, { data: accs }] = await Promise.all([
    supabase.from("bike_types").select("id, label").eq("is_enabled", true).order("label"),
    supabase.from("accommodations").select("id, name").order("name"),
  ]);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold text-forest">Nouveau vélo</h1>
      <form action={createBike} className="flex max-w-xl flex-col gap-4">
        {error && <p role="alert" className="rounded-xl2 bg-red-50 p-3 text-red-800">{errors[error] ?? errors.save}</p>}
        <label className="flex flex-col gap-1">Code interne *
          <input name="internal_code" required placeholder="ELEC-013" className={input} /></label>
        <label className="flex flex-col gap-1">Type *
          <select name="bike_type_id" required className={input}>
            {(types ?? []).map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select></label>
        <label className="flex flex-col gap-1">Hébergement
          <select name="accommodation_id" className={input}>
            <option value="">Non affecté</option>
            {(accs ?? []).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select></label>
        <label className="flex flex-col gap-1">Marque<input name="brand" className={input} /></label>
        <label className="flex flex-col gap-1">Modèle<input name="model" className={input} /></label>
        <label className="flex flex-col gap-1">Taille<input name="frame_size" className={input} /></label>
        <label className="flex flex-col gap-1">Numéro de série<input name="serial_number" className={input} /></label>
        <p className="text-sm">Le vélo est créé « Indisponible » : il devra être mis en service après contrôle.</p>
        <Button type="submit">Créer le vélo</Button>
      </form>
    </section>
  );
}

import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateBike } from "../update-action";
import { MANUAL_BIKE_STATUSES } from "@/lib/validation/admin";
import { Button } from "@/components/ui/Button";

const input = "min-h-12 rounded-xl2 border border-line bg-white px-4";
const statusLabels: Record<string, string> = {
  available: "Disponible", unavailable: "Indisponible", maintenance: "En maintenance",
  pending_check: "En attente de contrôle", stolen: "Volé", retired: "Retiré de la flotte",
  reserved: "Réservé", rented: "En location",
};
const errors: Record<string, string> = {
  validation: "Champs invalides.",
  in_use: "Ce vélo est réservé ou en location : traitez d'abord la réservation.",
  needs_accommodation: "Un vélo doit être affecté à un hébergement pour être disponible.",
  save: "L'enregistrement a échoué.",
};

export default async function EditBike({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const [{ data: bike }, { data: accs }, { data: events }] = await Promise.all([
    supabase.from("bikes").select("*").eq("id", id).maybeSingle(),
    supabase.from("accommodations").select("id, name").order("name"),
    supabase.from("bike_events").select("id, event_type, from_status, to_status, created_at").eq("bike_id", id).order("created_at", { ascending: false }).limit(20),
  ]);
  if (!bike) notFound();
  const locked = bike.status === "reserved" || bike.status === "rented";

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-forest">{bike.internal_code}</h1>
      <form action={updateBike} className="flex max-w-xl flex-col gap-4">
        <input type="hidden" name="id" value={bike.id} />
        {error && <p role="alert" className="rounded-xl2 bg-red-50 p-3 text-red-800">{errors[error] ?? errors.save}</p>}
        {locked && <p className="rounded-xl2 bg-accent/30 p-3">Statut actuel : {statusLabels[bike.status]} (géré par le système).</p>}
        <label className="flex flex-col gap-1">Statut
          <select name="status" defaultValue={locked ? "unavailable" : bike.status} disabled={locked} className={input}>
            {MANUAL_BIKE_STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select></label>
        <label className="flex flex-col gap-1">Hébergement
          <select name="accommodation_id" defaultValue={bike.accommodation_id ?? ""} disabled={locked} className={input}>
            <option value="">Non affecté</option>
            {(accs ?? []).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select></label>
        <label className="flex flex-col gap-1">Commentaires
          <textarea name="notes" defaultValue={bike.notes ?? ""} rows={3} disabled={locked} className="rounded-xl2 border border-line bg-white p-4" /></label>
        <Button type="submit" disabled={locked}>Enregistrer</Button>
      </form>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Historique</h2>
        {(events ?? []).length === 0 ? <p>Aucun événement.</p> : (
          <ul className="flex flex-col gap-1 text-sm">
            {(events ?? []).map((e) => (
              <li key={e.id}>
                {new Date(e.created_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} : {e.event_type}
                {e.from_status && e.to_status ? ` (${statusLabels[e.from_status] ?? e.from_status} → ${statusLabels[e.to_status] ?? e.to_status})` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

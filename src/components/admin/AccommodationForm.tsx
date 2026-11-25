import { saveAccommodation } from "@/app/admin/accommodations/actions";
import { Button } from "@/components/ui/Button";

type Values = Partial<{
  id: string; name: string; slug: string; type: string; address: string; city: string;
  postal_code: string; email: string; phone: string; manager_name: string;
  access_hours: string; access_instructions: string; commission_bps: number; is_active: boolean; mode: string;
}>;

const input = "min-h-12 rounded-xl2 border border-line bg-white px-4";

function Field({ label, name, defaultValue, type = "text", required = false, hint }: {
  label: string; name: string; defaultValue?: string | number | null; type?: string; required?: boolean; hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span>{label}{required && " *"}</span>
      <input name={name} type={type} required={required} defaultValue={defaultValue ?? ""} step={type === "number" ? "0.01" : undefined} className={input} />
      {hint && <span className="text-sm text-charcoal/70">{hint}</span>}
    </label>
  );
}

export function AccommodationForm({ values = {}, error }: { values?: Values; error?: string }) {
  const messages: Record<string, string> = {
    validation: "Certains champs sont invalides. Vérifiez le nom, l'adresse web (a-z, 0-9, tirets) et la commission.",
    slug_taken: "Cette adresse web est déjà utilisée.",
    save: "L'enregistrement a échoué.",
  };
  return (
    <form action={saveAccommodation} className="flex max-w-xl flex-col gap-4">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {error && <p role="alert" className="rounded-xl2 bg-red-50 p-3 text-red-800">{messages[error] ?? messages.save}</p>}
      <label className="flex flex-col gap-1">
        <span>Fonctionnement *</span>
        <select name="mode" defaultValue={values.mode ?? "self_service"} className={input}>
          <option value="self_service">Hébergement partenaire : libre-service (boîte à clés), avec commission</option>
          <option value="counter">Boutique Chez Léon : retrait et retour au comptoir, sans commission</option>
        </select>
        <span className="text-sm text-charcoal/70">En mode boutique : pas de code d'accès, pas de photos de retour, commission forcée à 0 %.</span>
      </label>
      <Field label="Nom commercial" name="name" defaultValue={values.name} required />
      <Field label="Adresse web (slug)" name="slug" defaultValue={values.slug} required
        hint="Définit le lien du QR code : /h/<slug>. Ne le changez pas après impression des QR codes." />
      <Field label="Type d'établissement" name="type" defaultValue={values.type ?? "hôtel"} required />
      <Field label="Adresse" name="address" defaultValue={values.address} />
      <Field label="Ville" name="city" defaultValue={values.city} />
      <Field label="Code postal" name="postal_code" defaultValue={values.postal_code} />
      <Field label="Email" name="email" type="email" defaultValue={values.email} />
      <Field label="Téléphone" name="phone" defaultValue={values.phone} />
      <Field label="Responsable" name="manager_name" defaultValue={values.manager_name} />
      <Field label="Horaires d'accès au local (ou d'ouverture de la boutique)" name="access_hours" defaultValue={values.access_hours} />
      <Field label="Instructions d'accès (ou de retrait en boutique)" name="access_instructions" defaultValue={values.access_instructions} />
      <Field label="Commission (%)" name="commission_percent" type="number" required
        defaultValue={((values.commission_bps ?? 2000) / 100).toString()} />
      <label className="flex items-center gap-2">
        <input type="checkbox" name="is_active" defaultChecked={values.is_active ?? true} className="h-5 w-5" />
        Établissement actif
      </label>
      <Button type="submit">Enregistrer</Button>
    </form>
  );
}

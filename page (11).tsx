import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { createPartner } from "./actions";
import { Button } from "@/components/ui/Button";

const input = "min-h-12 rounded-xl2 border border-sage bg-white px-4";
const errors: Record<string, string> = {
  validation: "Email invalide ou mot de passe trop court (12 caractères minimum).",
  exists: "Un compte existe déjà avec cet email.",
  create: "La création du compte a échoué.",
};

export default async function PartnersPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const [{ data: accs }, { data: links }] = await Promise.all([
    supabase.from("accommodations").select("id, name").order("name"),
    supabase.from("accommodation_users").select("user_id, accommodation_id"),
  ]);
  // Les emails sont dans auth.users : lecture via la clé service, côté serveur uniquement.
  const { data: users } = await createSupabaseServiceClient().auth.admin.listUsers({ perPage: 200 });
  const email = new Map((users?.users ?? []).map((u) => [u.id, u.email]));
  const accName = new Map((accs ?? []).map((a) => [a.id, a.name]));

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-forest">Comptes partenaires</h1>
      {saved && <p role="status" className="rounded-xl2 bg-sage/30 p-3">Compte créé. Transmettez le mot de passe provisoire de façon sécurisée.</p>}
      {error && <p role="alert" className="rounded-xl2 bg-red-50 p-3 text-red-800">{errors[error] ?? errors.create}</p>}

      <ul className="flex flex-col gap-2">
        {(links ?? []).length === 0 && <li>Aucun compte partenaire.</li>}
        {(links ?? []).map((l) => (
          <li key={`${l.user_id}-${l.accommodation_id}`} className="rounded-xl2 bg-white p-3">
            {email.get(l.user_id) ?? l.user_id} → {accName.get(l.accommodation_id) ?? l.accommodation_id}
          </li>
        ))}
      </ul>

      <form action={createPartner} className="flex max-w-xl flex-col gap-4 rounded-xl2 bg-white p-4">
        <h2 className="text-lg font-semibold">Créer un compte hébergeur</h2>
        <label className="flex flex-col gap-1">Email<input name="email" type="email" required className={input} /></label>
        <label className="flex flex-col gap-1">Mot de passe provisoire (12 caractères min.)
          <input name="password" type="password" required minLength={12} autoComplete="new-password" className={input} /></label>
        <label className="flex flex-col gap-1">Hébergement
          <select name="accommodation_id" required className={input}>
            {(accs ?? []).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select></label>
        <Button type="submit">Créer le compte</Button>
      </form>
    </section>
  );
}

import { changePassword } from "./actions";
import { Button } from "@/components/ui/Button";

const input = "min-h-12 rounded-xl2 border border-sage bg-white px-4";

export default async function PasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold text-forest">Changer mon mot de passe</h1>
      {saved && <p role="status" className="rounded-xl2 bg-sage/30 p-3">Mot de passe modifié.</p>}
      {error && <p role="alert" className="rounded-xl2 bg-red-50 p-3 text-red-800">Les deux mots de passe doivent être identiques (12 caractères minimum).</p>}
      <form action={changePassword} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">Nouveau mot de passe<input name="password" type="password" required minLength={12} autoComplete="new-password" className={input} /></label>
        <label className="flex flex-col gap-1">Confirmation<input name="confirm" type="password" required minLength={12} autoComplete="new-password" className={input} /></label>
        <Button type="submit">Enregistrer</Button>
      </form>
      <a href="/" className="underline">Retour</a>
    </main>
  );
}

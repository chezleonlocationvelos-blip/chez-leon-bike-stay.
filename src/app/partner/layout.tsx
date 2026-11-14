import { requireRole } from "@/lib/auth/roles";
import { signOut } from "@/lib/auth/actions";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("partner");
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex justify-end gap-4"><a href="/account/password" className="underline">Mot de passe</a><form action={signOut}><button className="underline">Déconnexion</button></form></div>
      {children}
    </div>
  );
}

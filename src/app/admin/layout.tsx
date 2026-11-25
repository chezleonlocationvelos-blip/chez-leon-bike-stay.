import Link from "next/link";
import { requireRole } from "@/lib/auth/roles";
import { getMessages } from "@/i18n";
import { signOut } from "@/lib/auth/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");
  const t = getMessages().nav;
  const links = [
    { href: "/admin", label: t.dashboard },
    { href: "/admin/accommodations", label: t.accommodations },
    { href: "/admin/bikes", label: "Vélos et accessoires" },
    { href: "/admin/planning", label: "Planning" },
    { href: "/admin/reservations", label: "Réservations" },
    { href: "/admin/pricing", label: "Tarifs et cautions" },
    { href: "/admin/partners", label: "Partenaires" },
    { href: "/admin/avis", label: "Avis" },
  ];
  return (
    <div className="mx-auto max-w-5xl p-6">
      <nav aria-label="Administration" className="mb-6 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-xl2 border border-line bg-white px-4 py-2 text-forest hover:bg-sage/20">
            {l.label}
          </Link>
        ))}
        <a href="/account/password" className="ml-auto px-4 py-2 underline">Mot de passe</a>
        <form action={signOut}><button className="rounded-xl2 px-4 py-2 underline">Déconnexion</button></form>
      </nav>
      {children}
    </div>
  );
}

import Link from "next/link";

const links = [
  { href: "/demo/admin", label: "Tableau de bord" },
  { href: "/demo/admin/reservations", label: "Réservations" },
  { href: "/demo/admin/bikes", label: "Vélos" },
  { href: "/demo/admin/accommodations", label: "Hébergements" },
  { href: "/demo/admin/pricing", label: "Tarifs et cautions" },
];

export default function DemoAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-forest">Espace administrateur</p>
      <nav aria-label="Administration (démonstration)" className="mb-6 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-xl2 border border-line bg-white px-4 py-2 text-forest hover:bg-sage/20">{l.label}</Link>
        ))}
      </nav>
      {children}
    </div>
  );
}

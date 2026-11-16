import Link from "next/link";

const cards = [
  { label: "Retours à clôturer", n: 1, href: "/demo/admin/reservations", hint: "Retours déclarés par les hébergeurs" },
  { label: "Vélos à contrôler", n: 1, href: "/demo/admin/bikes", hint: "Remettre en « Disponible » après contrôle et changement du code" },
  { label: "Cautions à surveiller (48 h)", n: 1, href: "/demo/admin/reservations", hint: "Locations proches sans caution autorisée" },
  { label: "Réservations à venir ou en cours", n: 5, href: "/demo/admin/reservations", hint: "Confirmées ou prêtes" },
];

export default function DemoAdminHome() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-5xl font-bold text-forest">Tableau de bord</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-xl2 border border-line bg-white p-4 hover:bg-sage/20">
            <div className="text-3xl font-bold text-forest">{c.n}</div>
            <div className="font-medium">{c.label}</div>
            <div className="text-sm text-charcoal/70">{c.hint}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

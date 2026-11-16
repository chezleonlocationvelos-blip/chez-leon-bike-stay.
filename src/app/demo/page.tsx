import Link from "next/link";

export default function DemoHome() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-6xl font-bold text-forest">Découvrir la plateforme</h1>
      <p className="max-w-2xl">Parcourez les espaces de Chez Léon Bike &amp; Stay avec des données d'exemple. Aucune connexion n'est nécessaire et rien de ce que vous voyez n'est réel.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/demo/admin" className="rounded-xl2 border border-line bg-white p-5 hover:bg-sage/20">
          <h2 className="font-display text-4xl font-bold text-forest">Administrateur</h2>
          <p className="mt-1 text-sm">Pilotage : réservations, flotte de vélos, hébergements partenaires, tarifs.</p>
        </Link>
        <Link href="/demo/partner" className="rounded-xl2 border border-line bg-white p-5 hover:bg-sage/20">
          <h2 className="font-display text-4xl font-bold text-forest">Hébergeur</h2>
          <p className="mt-1 text-sm">Ce que voit un camping ou un gîte : ses vélos, ses réservations, sa commission et son QR code.</p>
        </Link>
        <Link href="/h/demo-camping-cher" className="rounded-xl2 border border-line bg-white p-5 hover:bg-sage/20">
          <h2 className="font-display text-4xl font-bold text-forest">Client</h2>
          <p className="mt-1 text-sm">La page de réservation qu'ouvre le vacancier en scannant le QR code.</p>
        </Link>
      </div>
    </section>
  );
}

import { DEMO_ACCOMMODATIONS } from "@/lib/demo/data";

export default function DemoAccommodations() {
  return (
    <section>
      <h1 className="mb-4 text-5xl font-bold text-forest">Hébergements partenaires</h1>
      <div className="overflow-x-auto rounded-xl2 border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage/20"><tr>{["Établissement", "Type", "Ville", "Vélos", "Commission", "Paiements"].map((h) => <th key={h} scope="col" className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {DEMO_ACCOMMODATIONS.map((a) => (
              <tr key={a.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{a.name}</td><td className="px-4 py-3">{a.type}</td><td className="px-4 py-3">{a.city}</td>
                <td className="px-4 py-3">{a.bikes.electric} électriques · {a.bikes.classic} classiques</td>
                <td className="px-4 py-3">{a.commissionPct} %</td><td className="px-4 py-3">{a.stripe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm">Dans l'espace réel, l'administrateur crée un hébergement, règle sa commission, télécharge son QR code et lui ouvre un accès hébergeur.</p>
    </section>
  );
}

import { DEMO_BIKES } from "@/lib/demo/data";

export default function DemoBikes() {
  return (
    <section>
      <h1 className="mb-4 text-5xl font-bold text-forest">Vélos</h1>
      <div className="overflow-x-auto rounded-xl2 border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage/20"><tr>{["Code", "Type", "Hébergement", "Statut"].map((h) => <th key={h} scope="col" className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {DEMO_BIKES.map((b) => (
              <tr key={b.code} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{b.code}</td><td className="px-4 py-3">{b.type}</td><td className="px-4 py-3">{b.acc}</td><td className="px-4 py-3">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

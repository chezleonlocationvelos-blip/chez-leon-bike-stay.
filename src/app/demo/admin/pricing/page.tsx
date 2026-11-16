import { DEMO_PRICING } from "@/lib/demo/data";
import { euros } from "@/lib/format";

export default function DemoPricing() {
  return (
    <section>
      <h1 className="mb-4 text-5xl font-bold text-forest">Tarifs et cautions</h1>
      <div className="overflow-x-auto rounded-xl2 border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage/20"><tr>{["Type", "Demi-journée", "Journée", "2 jours", "Par jour dès 3 jours", "Caution"].map((h) => <th key={h} scope="col" className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {DEMO_PRICING.map((p) => (
              <tr key={p.type} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{p.type}</td><td className="px-4 py-3">{euros(p.half)}</td><td className="px-4 py-3">{euros(p.day)}</td>
                <td className="px-4 py-3">{euros(p.two)}</td><td className="px-4 py-3">{euros(p.three)}</td><td className="px-4 py-3">{euros(p.deposit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

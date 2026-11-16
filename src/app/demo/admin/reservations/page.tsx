import { DEMO_RESERVATIONS } from "@/lib/demo/data";
import { euros } from "@/lib/format";

export default function DemoReservations() {
  return (
    <section>
      <h1 className="mb-4 text-5xl font-bold text-forest">Réservations</h1>
      <div className="overflow-x-auto rounded-xl2 border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage/20"><tr>{["N°", "Client", "Hébergement", "Début", "Statut", "Total"].map((h) => <th key={h} scope="col" className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {DEMO_RESERVATIONS.map((r) => (
              <tr key={r.number} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{r.number}<span className="ml-2 rounded bg-accent px-2 text-xs">DÉMO</span></td>
                <td className="px-4 py-3">{r.customer}</td><td className="px-4 py-3">{r.acc}</td>
                <td className="px-4 py-3">{r.start}</td><td className="px-4 py-3">{r.status}</td><td className="px-4 py-3">{euros(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

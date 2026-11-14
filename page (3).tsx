import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { euros, formatParis } from "@/lib/format";
import { reservationStatusLabels } from "@/lib/labels";

type Row = {
  id: string; number: string; status: string; start_at: string; end_at: string; total_cents: number; is_demo: boolean;
  accommodations: { name: string } | null; customers: { first_name: string; last_name: string } | null;
};

export default async function AdminReservations() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("id, number, status, start_at, end_at, total_cents, is_demo, accommodations(name), customers(first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error("Impossible de charger les réservations.");
  const rows = (data ?? []) as unknown as Row[];

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold text-forest">Réservations</h1>
      {rows.length === 0 ? <p>Aucune réservation.</p> : (
        <div className="overflow-x-auto rounded-xl2 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-sage/20">
              <tr>{["N°", "Client", "Hébergement", "Début", "Statut", "Total"].map((h) => <th key={h} scope="col" className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-sage/30">
                  <td className="px-4 py-3 font-medium"><Link className="underline" href={`/admin/reservations/${r.id}`}>{r.number}</Link>{r.is_demo && <span className="ml-2 rounded bg-accent/40 px-2 text-xs">DÉMO</span>}</td>
                  <td className="px-4 py-3">{r.customers ? `${r.customers.first_name} ${r.customers.last_name}` : "—"}</td>
                  <td className="px-4 py-3">{r.accommodations?.name}</td>
                  <td className="px-4 py-3">{formatParis(r.start_at)}</td>
                  <td className="px-4 py-3">{reservationStatusLabels[r.status] ?? r.status}</td>
                  <td className="px-4 py-3">{euros(r.total_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

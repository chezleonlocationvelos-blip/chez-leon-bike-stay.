import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMessages } from "@/i18n";

export default async function AdminHome() {
  const supabase = await createSupabaseServerClient();
  const in48h = new Date(Date.now() + 48 * 3600_000).toISOString();
  const [check, declared, noDeposit, upcoming] = await Promise.all([
    supabase.from("bikes").select("id", { count: "exact", head: true }).eq("status", "pending_check"),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("status", "return_declared"),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("status", "confirmed").neq("deposit_status", "authorized").lt("start_at", in48h).gt("end_at", new Date().toISOString()),
    supabase.from("reservations").select("id", { count: "exact", head: true }).in("status", ["confirmed", "ready"]).gt("end_at", new Date().toISOString()),
  ]);
  const cards = [
    { label: "Retours à clôturer", n: declared.count ?? 0, href: "/admin/reservations", hint: "Retours déclarés par les clients (hébergements)" },
    { label: "Vélos à contrôler", n: check.count ?? 0, href: "/admin/bikes", hint: "Remettre en « Disponible » après contrôle et changement du code" },
    { label: "Cautions à surveiller (48 h)", n: noDeposit.count ?? 0, href: "/admin/reservations", hint: "Locations proches sans caution autorisée" },
    { label: "Réservations à venir ou en cours", n: upcoming.count ?? 0, href: "/admin/reservations", hint: "Confirmées ou prêtes" },
  ];
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-forest">{getMessages().admin.title}</h1>
      <Link href="/admin/planning" className="rounded-xl2 bg-forest p-4 text-white hover:opacity-90">
        <div className="font-bold">Planning du stock →</div>
        <div className="text-sm opacity-90">Vos vélos jour par jour, réservations et vélos libres (boutique et hébergements).</div>
      </Link>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-xl2 bg-white p-4 hover:bg-sage/20">
            <div className="text-3xl font-bold text-forest">{c.n}</div>
            <div className="font-medium">{c.label}</div>
            <div className="text-sm text-charcoal/70">{c.hint}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

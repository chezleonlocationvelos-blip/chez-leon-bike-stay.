import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMessages } from "@/i18n";
import { euros, formatParis } from "@/lib/format";
import { bikeStatusLabels, reservationStatusLabels } from "@/lib/labels";
import { commissionCents } from "@/lib/pricing";
import { declareReturn } from "./actions";

/** Toutes les lectures passent par le client utilisateur : la RLS limite aux hébergements du partenaire. */
export default async function PartnerHome() {
  const supabase = await createSupabaseServerClient();
  const [{ data: accs }, { data: bikes }, { data: reservations }] = await Promise.all([
    supabase.from("accommodations").select("id, name, slug, commission_bps"),
    supabase.from("bikes").select("id, internal_code, status, bike_types(label)").order("internal_code"),
    supabase.from("reservations").select("id, number, status, start_at, end_at, total_cents, accommodation_id")
      .in("status", ["confirmed", "access_preparing", "ready", "in_progress", "return_declared", "completed"])
      .order("start_at", { ascending: false }).limit(100),
  ]);
  const bps = new Map((accs ?? []).map((a) => [a.id, a.commission_bps]));
  const commission = (reservations ?? []).reduce((sum, r) => sum + commissionCents(r.total_cents, bps.get(r.accommodation_id) ?? 0), 0);
  const bikeRows = (bikes ?? []) as unknown as { id: string; internal_code: string; status: string; bike_types: { label: string } | null }[];

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-forest">{getMessages().partner.title}</h1>
      <p>{(accs ?? []).map((a) => a.name).join(", ")}</p>

      <div className="rounded-xl2 bg-white p-4">
        <p className="text-sm">Commission estimée sur les réservations confirmées ou terminées (100 dernières)</p>
        <p className="text-3xl font-bold">{euros(commission)}</p>
        <p className="text-sm text-charcoal/70">Estimation indicative. Le versement réel passera par Stripe Connect.</p>
      </div>

      <div className="rounded-xl2 border border-line bg-white p-4">
        <h2 className="mb-2 font-display text-3xl font-bold text-forest">Votre QR code</h2>
        <p className="mb-3 text-sm">Affichez-le à l'accueil ou dans vos hébergements : vos clients le scannent pour réserver un vélo.</p>
        {(accs ?? []).map((a) => (
          <div key={a.id} className="mb-4 flex flex-wrap items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/partner/qr?acc=${a.id}`} alt={`QR code de réservation : ${a.name}`} width={160} height={160} className="h-40 w-40" />
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-medium">{a.name}</span>
              <a className="underline" href={`/h/${a.slug}`} target="_blank" rel="noreferrer">Voir la page de réservation</a>
              <a className="underline" href={`/partner/qr?acc=${a.id}&format=png`}>Télécharger en PNG (impression, réseaux sociaux)</a>
              <a className="underline" href={`/partner/qr?acc=${a.id}&format=svg-download`}>Télécharger en SVG (affiche, grande taille)</a>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Vélos de votre établissement</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {bikeRows.map((b) => (
            <li key={b.id} className="flex justify-between rounded-xl2 bg-white p-3">
              <span>{b.internal_code} · {b.bike_types?.label}</span><span>{bikeStatusLabels[b.status] ?? b.status}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Réservations</h2>
        {(reservations ?? []).length === 0 ? <p>Aucune réservation confirmée.</p> : (
          <ul className="flex flex-col gap-2">
            {(reservations ?? []).map((r) => (
              <li key={r.id} className="rounded-xl2 bg-white p-3">
                <span className="font-medium">{r.number}</span> · {formatParis(r.start_at)} · {reservationStatusLabels[r.status] ?? r.status}
                {r.status === "ready" && (
                  <form action={declareReturn.bind(null, r.id)} className="mt-2">
                    <button className="rounded-xl2 border border-forest px-4 py-2 text-forest">Déclarer le retour des vélos</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

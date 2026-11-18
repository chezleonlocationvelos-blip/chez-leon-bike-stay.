import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/reservations/token";
import { euros, formatParis } from "@/lib/format";
import { simulateDemoPayment, startDepositAuthorization, startRentalPayment } from "./actions";
import { isStripeConfigured } from "@/lib/stripe/client";
import { Itineraries } from "@/components/Itineraries";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Ma réservation – Chez Léon", robots: { index: false, follow: false } };
const ACCESS_OPENS_BEFORE_MS = 60 * 60 * 1000;

export default async function ReservationPage({
  params, searchParams,
}: { params: Promise<{ token: string }>; searchParams: Promise<{ paid?: string; deposit?: string; error?: string }> }) {
  const { token } = await params;
  const { paid, deposit: depositParam, error: errorParam } = await searchParams;
  const db = createSupabaseServiceClient();
  await db.rpc("release_expired_holds");

  const { data: r } = await db
    .from("reservations")
    .select(`id, number, status, start_at, end_at, billed_days, total_cents, deposit_amount_cents, deposit_status, is_demo,
             accommodations(name, slug, latitude, longitude, access_hours, access_instructions),
             reservation_items(quantity, unit_price_cents, bike_types(label)),
             reservation_accessories(quantity, unit_price_cents, accessories(label))`)
    .eq("access_token_hash", hashToken(token))
    .maybeSingle();
  if (!r) notFound();

  const { data: grant } = await db.from("access_grants").select("code, simulated, valid_from, valid_until").eq("reservation_id", r.id).maybeSingle();
  const now = Date.now();
  const depositOk = r.deposit_status === "authorized";
  const codeVisible = !!grant && depositOk && ["confirmed", "ready"].includes(r.status) && now >= new Date(grant.valid_from).getTime() - ACCESS_OPENS_BEFORE_MS && now <= new Date(grant.valid_until).getTime();
  const acc = r.accommodations as unknown as { name: string; slug: string; latitude: number | null; longitude: number | null; access_hours: string | null; access_instructions: string | null };
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true" && r.is_demo;
  const live = !demo && isStripeConfigured();
  const depositOpensAt = new Date(r.start_at).getTime() - 24 * 3600 * 1000;
  const errorMessages: Record<string, string> = {
    too_early: "La caution s'autorise dans les 24 h avant le retrait.",
    not_payable: "Cette action n'est plus possible pour cette réservation.",
    total_mismatch: "Une erreur de montant est survenue. Contactez-nous.",
    not_found: "Réservation introuvable.",
  };

  return (
    <>
    <SiteHeader />
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-6">
      <h1 className="text-5xl font-bold text-forest">Réservation {r.number}</h1>

      <section className="rounded-xl2 bg-white p-4">
        <p className="font-medium">{acc.name}</p>
        <p>Du {formatParis(r.start_at)}</p>
        <p>Au {formatParis(r.end_at)}</p>
      </section>

      <section className="rounded-xl2 bg-white p-4">
        <ul className="flex flex-col gap-1">
          {(r.reservation_items as unknown as { quantity: number; unit_price_cents: number; bike_types: { label: string } }[]).map((i, k) => (
            <li key={k} className="flex justify-between"><span>{i.quantity} × {i.bike_types.label}</span><span>{euros(i.quantity * i.unit_price_cents)}</span></li>
          ))}
          {(r.reservation_accessories as unknown as { quantity: number; unit_price_cents: number; accessories: { label: string } }[]).map((i, k) => (
            <li key={`a${k}`} className="flex justify-between"><span>{i.quantity} × {i.accessories.label}</span><span>{euros(i.quantity * i.unit_price_cents)}</span></li>
          ))}
          <li className="flex justify-between border-t border-line pt-2 font-semibold"><span>Total</span><span>{euros(r.total_cents)}</span></li>
          <li className="flex justify-between text-sm"><span>Caution (empreinte bancaire, non débitée)</span><span>{euros(r.deposit_amount_cents)}</span></li>
        </ul>
      </section>

      {errorParam && errorMessages[errorParam] && <p role="alert" className="rounded-xl2 bg-red-50 p-3 text-red-800">{errorMessages[errorParam]}</p>}
      {(paid || depositParam) && !(r.status === "ready" || depositOk) && <p role="status" className="rounded-xl2 bg-sage/30 p-3">Merci ! Nous confirmons votre opération avec la banque, rechargez cette page dans un instant.</p>}

      {r.status === "pending_payment" && (
        <section className="flex flex-col gap-3 rounded-xl2 bg-accent/30 p-4">
          <p>Vos vélos sont bloqués quelques minutes. Finalisez le paiement pour confirmer.</p>
          {demo ? (
            <form action={simulateDemoPayment.bind(null, token)}>
              <p className="mb-2 text-sm font-semibold">MODE DÉMONSTRATION : aucun vrai paiement ni caution.</p>
              <Button type="submit">Simuler le paiement et la caution</Button>
            </form>
          ) : live ? (
            <form action={startRentalPayment.bind(null, token)}>
              <Button type="submit">Payer {euros(r.total_cents)} par carte</Button>
            </form>
          ) : (
            <p className="text-sm">Le paiement en ligne sera disponible prochainement.</p>
          )}
        </section>
      )}

      {r.status === "cancelled" && <p role="alert" className="rounded-xl2 bg-red-50 p-3 text-red-800">Cette réservation a expiré faute de paiement. Vous pouvez refaire une réservation.</p>}

      {live && ["confirmed"].includes(r.status) && !depositOk && (
        <section className="flex flex-col gap-3 rounded-xl2 bg-accent/30 p-4">
          <h2 className="text-lg font-semibold">Caution : {euros(r.deposit_amount_cents)}</h2>
          <p className="text-sm">Il s'agit d'une empreinte bancaire : rien n'est débité, et elle est libérée à la restitution du matériel en bon état.</p>
          {Date.now() >= depositOpensAt ? (
            <form action={startDepositAuthorization.bind(null, token)}><Button type="submit">Autoriser la caution</Button></form>
          ) : (
            <p>Vous pourrez l'autoriser à partir du {formatParis(new Date(depositOpensAt))}. C'est elle qui débloque l'affichage du code d'accès.</p>
          )}
        </section>
      )}

      {(r.status === "confirmed" || r.status === "ready") && (
        <section className="flex flex-col gap-2 rounded-xl2 bg-white p-4">
          <h2 className="text-lg font-semibold">Accès aux vélos</h2>
          {acc.access_hours && <p>Horaires d'accès : {acc.access_hours}</p>}
          {acc.access_instructions && <p>{acc.access_instructions}</p>}
          {codeVisible && grant ? (
            <>
              <p className="text-3xl font-bold tracking-widest">{grant.code}</p>
              {grant.simulated && <p className="text-sm font-semibold text-red-800">CODE FICTIF DE DÉMONSTRATION : il n'ouvre aucun cadenas réel.</p>}
            </>
          ) : (
            <p>{depositOk ? "Votre code s'affichera ici 1 h avant le début de la location." : "Votre code s'affichera ici une fois la caution autorisée, 1 h avant le début de la location."}</p>
          )}
        </section>
      )}
    {!["draft", "pending_payment", "cancelled"].includes(r.status) && (
        <Itineraries slug={acc.slug} latitude={acc.latitude} longitude={acc.longitude} unlocked />
      )}
    </main>
    </>
  );
}

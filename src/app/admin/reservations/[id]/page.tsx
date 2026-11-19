import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { euros, formatParis } from "@/lib/format";
import { reservationStatusLabels } from "@/lib/labels";
import { closeRental, retryCommission } from "./actions";
import { Button } from "@/components/ui/Button";
import { commissionCents } from "@/lib/pricing";

const messages: Record<string, [string, "ok" | "ko"]> = {
  closed: ["Location clôturée. Les vélos sont en attente de contrôle : remettez-les en « Disponible » après changement du code.", "ok"],
  already: ["Cette location est déjà clôturée.", "ko"],
  invalid: ["Champs invalides.", "ko"],
  amount: ["Le montant ne peut pas dépasser la caution.", "ko"],
  notes_required: ["Un dommage doit être justifié (10 caractères minimum).", "ko"],
  not_found: ["Réservation introuvable.", "ko"],
  no_deposit_payment: ["Aucune empreinte de caution enregistrée pour cette réservation.", "ko"],
  stripe_missing: ["Stripe n'est pas configuré.", "ko"],
  stripe_failed: ["Stripe a refusé l'opération (empreinte peut-être expirée). Rien n'a été modifié : consultez le tableau de bord Stripe.", "ko"],
  db_failed: ["Erreur d'enregistrement. Relancez : l'opération Stripe ne sera pas doublée.", "ko"],
  commission_ok: ["Commission versée.", "ok"],
  commission_no_account: ["L'hébergeur n'a pas de compte Stripe actif : commission en attente.", "ko"],
  commission_zero: ["Aucune commission à verser.", "ok"],
  commission_no_payment: ["Pas de paiement réel enregistré (réservation de démonstration ?).", "ko"],
  commission_failed: ["Le versement a échoué. Réessayez.", "ko"],
};

export default async function ReservationDetail({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const { id } = await params;
  const { msg } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: r } = await supabase.from("reservations")
    .select(`id, number, status, payment_status, deposit_status, start_at, end_at, total_cents, deposit_amount_cents, is_demo, return_attested_at,
             accommodations(name, commission_bps, stripe_payouts_enabled),
             customers(first_name, last_name, email, phone),
             reservation_items(quantity, unit_price_cents, bike_types(label)),
             reservation_accessories(quantity, unit_price_cents, accessories(label))`)
    .eq("id", id).maybeSingle();
  if (!r) notFound();

  const [{ data: payments }, { data: ret }, { data: transfer }, { data: bikes }] = await Promise.all([
    supabase.from("payments").select("kind, status, amount_cents, created_at").eq("reservation_id", id).order("created_at"),
    supabase.from("reservation_returns").select("damage_cents, notes, created_at").eq("reservation_id", id).maybeSingle(),
    supabase.from("commission_transfers").select("stripe_transfer_id, amount_cents").eq("reservation_id", id).maybeSingle(),
    supabase.from("reservation_bike_assignments").select("bikes(internal_code)").eq("reservation_id", id).eq("active", true),
  ]);
  const { data: photoRows } = await createSupabaseServiceClient().from("reservation_return_photos").select("storage_path, kind, label, latitude, longitude, accuracy_m, created_at").eq("reservation_id", id).order("created_at");
  const photos = await Promise.all((photoRows ?? []).map(async (p) => {
    const { data } = await createSupabaseServiceClient().storage.from("return-photos").createSignedUrl(p.storage_path, 3600);
    return { ...p, url: data?.signedUrl ?? null };
  }));
  const acc = r.accommodations as unknown as { name: string; commission_bps: number; stripe_payouts_enabled: boolean };
  const cust = r.customers as unknown as { first_name: string; last_name: string; email: string; phone: string } | null;
  const items = r.reservation_items as unknown as { quantity: number; unit_price_cents: number; bike_types: { label: string } }[];
  const accs = r.reservation_accessories as unknown as { quantity: number; unit_price_cents: number; accessories: { label: string } }[];
  const bikeCodes = (bikes ?? []).map((b) => (b.bikes as unknown as { internal_code: string }).internal_code).join(", ");
  const canClose = ["confirmed", "ready", "in_progress", "return_declared"].includes(r.status);
  const m = msg ? messages[msg] : undefined;
  const commission = commissionCents(r.total_cents, acc.commission_bps);

  return (
    <section className="flex flex-col gap-5">
      <Link href="/admin/reservations" className="underline">← Réservations</Link>
      <h1 className="text-2xl font-bold text-forest">{r.number} {r.is_demo && <span className="rounded bg-accent/40 px-2 text-sm">DÉMO</span>}</h1>
      {m && <p role={m[1] === "ko" ? "alert" : "status"} className={`rounded-xl2 p-3 ${m[1] === "ko" ? "bg-red-50 text-red-800" : "bg-sage/30"}`}>{m[0]}</p>}

      <div className="rounded-xl2 bg-white p-4">
        <p className="font-medium">{reservationStatusLabels[r.status] ?? r.status} · {acc.name}</p>
        <p>Du {formatParis(r.start_at)}</p><p>Au {formatParis(r.end_at)}</p>
        <p>Vélos attribués : {bikeCodes || "—"}</p>
        {cust && <p className="mt-2">{cust.first_name} {cust.last_name} · {cust.email} · {cust.phone}</p>}
      </div>

      <div className="rounded-xl2 bg-white p-4">
        <ul className="flex flex-col gap-1">
          {items.map((i, k) => <li key={k} className="flex justify-between"><span>{i.quantity} × {i.bike_types.label}</span><span>{euros(i.quantity * i.unit_price_cents)}</span></li>)}
          {accs.map((i, k) => <li key={`a${k}`} className="flex justify-between"><span>{i.quantity} × {i.accessories.label}</span><span>{euros(i.quantity * i.unit_price_cents)}</span></li>)}
          <li className="flex justify-between border-t border-line pt-2 font-semibold"><span>Total</span><span>{euros(r.total_cents)}</span></li>
          <li className="flex justify-between text-sm"><span>Commission hébergeur ({acc.commission_bps / 100} %)</span><span>{euros(commission)}</span></li>
        </ul>
      </div>

      <div className="rounded-xl2 bg-white p-4 text-sm">
        <h2 className="mb-1 font-semibold">Paiements Stripe</h2>
        {(payments ?? []).length === 0 ? <p>Aucun paiement enregistré.</p> : (
          <ul>{(payments ?? []).map((p, k) => <li key={k}>{p.kind === "rental" ? "Location" : "Caution"} · {euros(p.amount_cents)} · {p.status}</li>)}</ul>
        )}
        <p className="mt-1">Caution : {euros(r.deposit_amount_cents)} · statut {r.deposit_status}</p>
      </div>

      {photos.length > 0 && (
        <div className="rounded-xl2 bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold">Photos de restitution (prises en direct)</h2>
          {r.return_attested_at && <p className="mb-2 text-sm">Attestation cochée le {formatParis(r.return_attested_at)} : « cadenassé le vélo et clé remise dans la boîte ».</p>}
          <ul className="grid gap-3 sm:grid-cols-2">
            {photos.map((p, k) => (
              <li key={k} className="text-sm">
                {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.url} alt={`Photo de restitution ${k + 1}`} className="w-full rounded-xl2" /></a>}
                <p><strong>{p.kind === "keybox" ? "Boîte à clés" : (p.label ?? "Vélo")}</strong> · reçue le {formatParis(p.created_at)}{p.latitude != null ? <> · <a className="underline" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}>position{p.accuracy_m != null ? ` (±${Math.round(p.accuracy_m)} m)` : ""}</a></> : " · position non partagée"}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canClose && (
        <form action={closeRental} className="flex max-w-xl flex-col gap-3 rounded-xl2 bg-white p-4">
          <h2 className="text-lg font-semibold">Clôturer la location</h2>
          <input type="hidden" name="id" value={r.id} />
          <label className="flex flex-col gap-1">Montant du dommage à prélever sur la caution (€)
            <input name="damage_eur" type="number" min="0" max={r.deposit_amount_cents / 100} step="0.01" defaultValue="0" required className="min-h-12 rounded-xl2 border border-line px-4" />
            <span className="text-sm">0 = l'empreinte est libérée. Maximum : {euros(r.deposit_amount_cents)}. Le reste de l'empreinte est libéré automatiquement.</span></label>
          <label className="flex flex-col gap-1">Constat (obligatoire en cas de dommage)
            <textarea name="notes" rows={3} className="rounded-xl2 border border-line p-3" /></label>
          <Button type="submit">Clôturer</Button>
        </form>
      )}

      {ret && (
        <div className="rounded-xl2 bg-white p-4">
          <h2 className="font-semibold">Restitution</h2>
          <p>Dommage retenu : {euros(ret.damage_cents)}</p>
          {ret.notes && <p className="text-sm">{ret.notes}</p>}
          <p className="mt-2 text-sm">
            Commission : {transfer ? `versée (${euros(transfer.amount_cents)}, ${transfer.stripe_transfer_id})`
              : acc.stripe_payouts_enabled ? "en attente de versement" : "en attente : compte Stripe de l'hébergeur incomplet"}
          </p>
          {!transfer && <form action={retryCommission.bind(null, r.id)} className="mt-2"><Button type="submit" variant="secondary">Verser la commission</Button></form>}
        </div>
      )}
    </section>
  );
}

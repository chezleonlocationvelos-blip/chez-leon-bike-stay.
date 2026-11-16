import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { appUrl } from "@/lib/stripe/client";
import { decrypt, hasAppSecret } from "@/lib/crypto";
import { formatParis } from "@/lib/format";
import { confirmationEmail, depositReminderEmail, ownerNewReservationEmail } from "./templates";
import { sendEmail } from "./send";

type Kind = "confirmation" | "deposit_reminder";

async function load(id: string) {
  const db = createSupabaseServiceClient();
  const { data } = await db.from("reservations")
    .select(`id, number, start_at, end_at, total_cents, deposit_amount_cents, access_token_enc,
             accommodations(name), customers(first_name, last_name, email, phone),
             reservation_items(quantity, unit_price_cents, bike_types(label)),
             reservation_accessories(quantity, unit_price_cents, accessories(label))`)
    .eq("id", id).maybeSingle();
  return data as unknown as {
    id: string; number: string; start_at: string; end_at: string; total_cents: number; deposit_amount_cents: number; access_token_enc: string | null;
    accommodations: { name: string }; customers: { first_name: string; last_name: string | null; email: string; phone: string | null };
    reservation_items: { quantity: number; unit_price_cents: number; bike_types: { label: string } }[];
    reservation_accessories: { quantity: number; unit_price_cents: number; accessories: { label: string } }[];
  } | null;
}

/** Envoie l'email une seule fois par réservation et par type (clé unique en base). Réessaie si l'envoi a échoué. */
export async function notify(reservationId: string, kind: Kind): Promise<"sent" | "duplicate" | "skipped"> {
  if (!hasAppSecret()) { console.warn("Email ignoré : APP_SECRET absente."); return "skipped"; }
  const db = createSupabaseServiceClient();
  const r = await load(reservationId);
  if (!r || !r.access_token_enc) return "skipped";

  const { data: claimed } = await db.from("notifications")
    .upsert({ reservation_id: reservationId, kind }, { onConflict: "reservation_id,kind", ignoreDuplicates: true }).select("id");
  if (!claimed || claimed.length === 0) return "duplicate";

  try {
    const base = {
      firstName: r.customers.first_name, number: r.number, accommodation: r.accommodations.name,
      startLabel: formatParis(r.start_at), endLabel: formatParis(r.end_at),
      link: `${appUrl()}/r/${decrypt(r.access_token_enc)}`,
    };
    const msg = kind === "confirmation"
      ? confirmationEmail({
          ...base, totalCents: r.total_cents, depositCents: r.deposit_amount_cents,
          lines: [
            ...r.reservation_items.map((i) => ({ label: i.bike_types.label, qty: i.quantity, totalCents: i.quantity * i.unit_price_cents })),
            ...r.reservation_accessories.map((i) => ({ label: i.accessories.label, qty: i.quantity, totalCents: i.quantity * i.unit_price_cents })),
          ],
        })
      : depositReminderEmail({ ...base, depositCents: r.deposit_amount_cents });
    const res = await sendEmail(r.customers.email, msg);
    if (res === "skipped") { await db.from("notifications").delete().eq("reservation_id", reservationId).eq("kind", kind); return "skipped"; }
    if (kind === "confirmation") await notifyOwner(r, base);
    return "sent";
  } catch (e) {
    await db.from("notifications").delete().eq("reservation_id", reservationId).eq("kind", kind); // permet un nouvel essai
    throw e;
  }
}

/** Alerte au gérant (OWNER_EMAIL, par défaut reservationschezleon@gmail.com). Un échec ne doit jamais bloquer l'email du client. */
async function notifyOwner(
  r: NonNullable<Awaited<ReturnType<typeof load>>>,
  base: { number: string; accommodation: string; startLabel: string; endLabel: string; firstName: string; link: string },
) {
  try {
    const to = process.env.OWNER_EMAIL || "reservationschezleon@gmail.com";
    const msg = ownerNewReservationEmail({
      ...base,
      customerName: `${r.customers.first_name} ${r.customers.last_name ?? ""}`.trim(),
      customerEmail: r.customers.email, customerPhone: r.customers.phone ?? "téléphone non renseigné",
      totalCents: r.total_cents, depositCents: r.deposit_amount_cents,
      lines: [
        ...r.reservation_items.map((i) => ({ label: i.bike_types.label, qty: i.quantity, totalCents: i.quantity * i.unit_price_cents })),
        ...r.reservation_accessories.map((i) => ({ label: i.accessories.label, qty: i.quantity, totalCents: i.quantity * i.unit_price_cents })),
      ],
      adminLink: `${appUrl()}/admin/reservations/${r.id}`,
    });
    await sendEmail(to, msg);
  } catch (e) {
    console.error("Alerte gérant non envoyée", e);
  }
}

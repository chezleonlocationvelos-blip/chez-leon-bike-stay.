import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { submitReservation } from "./actions";
import { Button } from "@/components/ui/Button";
import { euros, todayParis } from "@/lib/format";
import { DEFAULT_SLOTS } from "@/lib/availability/slots";
import { TodayBanner } from "@/components/TodayBanner";
import { Itineraries } from "@/components/Itineraries";
import { SiteHeader } from "@/components/SiteHeader";
import { ACCOMMODATION_PHOTOS, DEFAULT_ACCOMMODATION_PHOTO } from "@/lib/photos";

const input = "min-h-12 rounded-xl2 border border-line bg-white px-4";
const errors: Record<string, string> = {
  customer: "Vérifiez vos coordonnées et acceptez les conditions de location.",
  period: "Dates ou créneau invalides.",
  quantity: "Quantités invalides.",
  empty: "Choisissez au moins un vélo.",
  past: "Ce créneau est passé ou trop proche de sa fin. Choisissez un autre créneau.",
  too_long: "La durée maximale de réservation est de 30 jours.",
  no_bikes: "Plus assez de vélos disponibles sur cette période. Essayez d'autres dates, ou moins de vélos.",
  no_panniers: "Pas assez de sacoches disponibles.",
  rate_limit: "Trop de réservations en cours. Réessayez dans quelques minutes.",
  conflict: "Un autre client vient de réserver ces vélos. Réessayez.",
  not_found: "Hébergement introuvable.",
  server: "Une erreur est survenue. Réessayez dans un instant.",
};

export const metadata = { title: "Louer un vélo – Chez Léon" };

export default async function AccommodationPage({
  params, searchParams,
}: { params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string }> }) {
  const { slug } = await params;
  const { error } = await searchParams;
  const db = createSupabaseServiceClient();
  const { data: acc } = await db.from("accommodations").select("id, name, city, is_active, latitude, longitude").eq("slug", slug).maybeSingle();
  if (!acc || !acc.is_active) notFound();

  const [{ data: types }, { data: pannier }, { data: s }] = await Promise.all([
    db.from("bike_types").select("*").eq("is_enabled", true).order("daily_price_cents", { ascending: false }),
    db.from("accessories").select("daily_price_cents").eq("code", "pannier").eq("is_enabled", true).maybeSingle(),
    db.from("application_settings").select("value").eq("key", "half_day_slots").maybeSingle(),
  ]);
  const slots = Array.isArray(s?.value) ? s.value : DEFAULT_SLOTS;
  const today = todayParis();
  const submit = submitReservation.bind(null, slug);
  const photo = ACCOMMODATION_PHOTOS[slug] ?? DEFAULT_ACCOMMODATION_PHOTO;

  return (
    <>
    <SiteHeader />
    <section
      className="mt-3 bg-gradient-to-b from-[#6c7f45] to-sage bg-cover bg-center"
      style={photo ? { backgroundImage: `linear-gradient(180deg, rgba(47,61,25,0.15) 0%, rgba(47,61,25,0.7) 100%), url(${photo})` } : undefined}
    >
      <div className={`mx-auto flex max-w-5xl flex-col justify-end px-6 pb-6 md:pb-10 ${photo ? "pt-32 md:pt-56" : "pt-14 md:pt-24"}`}>
        <h1 className="text-6xl font-bold leading-[0.95] text-white md:text-8xl">Louer un vélo</h1>
        <p className="mt-2 text-white">{acc.name}{acc.city ? `, ${acc.city}` : ""}</p>
      </div>
    </section>
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <TodayBanner accommodationId={acc.id} latitude={acc.latitude} longitude={acc.longitude} />
      <p className="rounded-xl2 bg-accent p-3 text-sm text-forest">
        Réservez à l'avance pour garantir la disponibilité de votre vélo. La réservation le jour même reste possible selon les vélos libres.
      </p>

      {error && <p role="alert" className="rounded-xl2 bg-red-50 p-3 text-red-800">{errors[error] ?? errors.server}</p>}

      <form action={submit} className="flex flex-col gap-6 lg:grid lg:grid-cols-5 lg:items-start lg:gap-8">
        <div aria-hidden="true" className="absolute left-[-9999px]"><label>Ne pas remplir<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <div className="flex flex-col gap-6 lg:col-span-3">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-display text-4xl font-bold text-forest">1. Durée</legend>
          <label className="flex items-center gap-2"><input type="radio" name="mode" value="days" defaultChecked className="h-5 w-5" /> Une ou plusieurs journées (9h00 – 18h30)</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">Du<input type="date" name="start_date" min={today} defaultValue={today} className={input} /></label>
            <label className="flex flex-col gap-1 text-sm">Au (inclus)<input type="date" name="end_date" min={today} defaultValue={today} className={input} /></label>
          </div>
          <label className="flex items-center gap-2"><input type="radio" name="mode" value="half_day" className="h-5 w-5" /> Une demi-journée (4 h)</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">Date<input type="date" name="date" min={today} defaultValue={today} className={input} /></label>
            <label className="flex flex-col gap-1 text-sm">Créneau
              <select name="slot" className={input}>
                {slots.map((sl: { id: string; start: string; end: string }) => (
                  <option key={sl.id} value={sl.id}>{sl.start.replace(":", "h")} – {sl.end.replace(":", "h")}</option>
                ))}
              </select></label>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-display text-4xl font-bold text-forest">2. Vélos</legend>
          {(types ?? []).map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-4 rounded-xl2 border border-line bg-white p-4">
              <div>
                <div className="font-medium">{t.label}</div>
                <div className="text-sm text-charcoal/80">
                  {euros(t.half_day_price_cents)} la demi-journée · {euros(t.daily_price_cents)} le jour · {euros(t.two_days_price_cents)} les 2 jours · {euros(t.price_from_three_days_cents)}/jour dès 3 jours
                </div>
                <div className="text-sm text-charcoal/80">Caution : {euros(t.deposit_cents)} par vélo (empreinte bancaire, non débitée)</div>
              </div>
              <select name={`qty_${t.code}`} defaultValue="0" aria-label={`Nombre de ${t.label}`} className={input}>
                {Array.from({ length: 11 }, (_, n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          ))}
          <p className="text-sm">Casque et antivol inclus.</p>
          {pannier && (
            <label className="flex items-center justify-between gap-4 rounded-xl2 border border-line bg-white p-4">
              <span>Sacoches ({euros(pannier.daily_price_cents)} par sacoche et par jour)</span>
              <select name="panniers" defaultValue="0" className={input}>
                {Array.from({ length: 5 }, (_, n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          )}
        </fieldset>

        </div>
        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:col-span-2">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-display text-4xl font-bold text-forest">3. Vos coordonnées</legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">Prénom<input name="first_name" required autoComplete="given-name" className={input} /></label>
            <label className="flex flex-col gap-1 text-sm">Nom<input name="last_name" required autoComplete="family-name" className={input} /></label>
          </div>
          <label className="flex flex-col gap-1 text-sm">Email<input type="email" name="email" required autoComplete="email" className={input} /></label>
          <label className="flex flex-col gap-1 text-sm">Téléphone<input type="tel" name="phone" required autoComplete="tel" className={input} /></label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="accept_terms" required className="mt-1 h-5 w-5" />
            <span>J'accepte les <a href="/conditions" target="_blank" className="underline">conditions de location</a> et la <a href="/confidentialite" target="_blank" className="underline">politique de confidentialité</a>.</span>
          </label>
        </fieldset>

        <Button type="submit">Voir mon récapitulatif</Button>
        </div>
      </form>
      <Itineraries slug={slug} latitude={acc.latitude} longitude={acc.longitude} />
    </main>
    </>
  );
}

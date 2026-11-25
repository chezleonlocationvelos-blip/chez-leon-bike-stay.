import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { submitReservation } from "./actions";
import { Button } from "@/components/ui/Button";
import { euros, todayParis } from "@/lib/format";
import { DEFAULT_SLOTS } from "@/lib/availability/slots";
import { TodayBanner } from "@/components/TodayBanner";
import { DurationPicker } from "@/components/booking/DurationPicker";
import { BikeCard } from "@/components/booking/BikeCard";
import { AccessoryStepper } from "@/components/booking/AccessoryStepper";
import { loadCatalog } from "@/lib/reservations/catalog";
import { AccommodationReviews } from "@/components/AccommodationReviews";
import { ImageCarousel } from "@/components/ImageCarousel";
import { Itineraries } from "@/components/Itineraries";
import { SiteHeader } from "@/components/SiteHeader";
import { isCounter } from "@/lib/accommodations";
import { ACCOMMODATION_GALLERY, ACCOMMODATION_PHOTOS, DEFAULT_ACCOMMODATION_PHOTO } from "@/lib/photos";

const input = "min-h-12 rounded-xl2 border border-line bg-white px-4";
const errors: Record<string, string> = {
  customer: "Vérifiez vos coordonnées et acceptez les conditions de location.",
  period: "Dates ou créneau invalides.",
  quantity: "Quantités invalides.",
  empty: "Choisissez au moins un vélo.",
  past: "Ce créneau est passé ou trop proche de sa fin. Choisissez un autre créneau.",
  too_long: "La durée maximale de réservation est de 30 jours.",
  no_bikes: "Plus assez de vélos disponibles sur cette période. Essayez d'autres dates, ou moins de vélos.",
  no_panniers: "Un accessoire n'est plus disponible en quantité suffisante sur ces dates. Réduisez la quantité ou changez de dates.",
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
  const { data: acc } = await db.from("accommodations").select("id, name, city, address, is_active, latitude, longitude, mode, access_hours, access_instructions").eq("slug", slug).maybeSingle();
  if (!acc || !acc.is_active) notFound();

  const [catalog, { data: s }] = await Promise.all([
    loadCatalog(acc.id),
    db.from("application_settings").select("value").eq("key", "half_day_slots").maybeSingle(),
  ]);
  const slots = Array.isArray(s?.value) ? s.value : DEFAULT_SLOTS;
  const today = todayParis();
  const submit = submitReservation.bind(null, slug);
  const photo = ACCOMMODATION_PHOTOS[slug] ?? DEFAULT_ACCOMMODATION_PHOTO;
  const gallery = ACCOMMODATION_GALLERY[slug] ?? [];
  const counter = isCounter(acc);

  return (
    <>
    <SiteHeader />
    <section
      className="bg-gradient-to-b from-[#6c7f45] to-sage bg-cover bg-center"
      style={photo ? { backgroundImage: `linear-gradient(180deg, rgba(47,61,25,0.15) 0%, rgba(47,61,25,0.7) 100%), url(${photo})` } : undefined}
    >
      <div className={`mx-auto flex max-w-5xl flex-col justify-end px-6 pb-6 md:pb-10 ${photo ? "pt-32 md:pt-56" : "pt-14 md:pt-24"}`}>
        <h1 className="text-6xl font-bold leading-[0.95] text-white md:text-8xl">{counter ? "Réservez vos vélos" : "Louer un vélo"}</h1>
        <p className="mt-2 text-white">{acc.name}{acc.city ? `, ${acc.city}` : ""}{counter ? " · retrait à la boutique" : ""}</p>
      </div>
    </section>
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      {gallery.length > 0 && <ImageCarousel images={gallery} />}
      {counter && (
        <section className="flex flex-col gap-1 rounded-xl2 border border-line bg-white p-4">
          <h2 className="font-display text-3xl font-bold text-forest">Retrait et retour à la boutique</h2>
          {acc.address && <p>{acc.address}{acc.city ? `, ${acc.city}` : ""}</p>}
          {acc.access_hours && <p>Horaires : {acc.access_hours}</p>}
          {acc.access_instructions && <p className="text-sm">{acc.access_instructions}</p>}
          <p className="text-sm">Votre réservation est confirmée dès le paiement : vos vélos vous attendent, réglés et prêts à partir.</p>
        </section>
      )}
      <TodayBanner accommodationId={acc.id} latitude={acc.latitude} longitude={acc.longitude} />
      <p className="rounded-xl2 bg-accent p-3 text-sm text-forest">
        Réservez à l'avance pour garantir la disponibilité de votre vélo. La réservation le jour même reste possible selon les vélos libres.
      </p>

      {error && <p role="alert" className="rounded-xl2 bg-red-50 p-3 text-red-800">{errors[error] ?? errors.server}</p>}

      <form action={submit} className="flex flex-col gap-6 lg:grid lg:grid-cols-5 lg:items-start lg:gap-8">
        <div aria-hidden="true" className="absolute left-[-9999px]"><label>Ne pas remplir<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <div className="flex flex-col gap-8 lg:col-span-3">
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-4xl font-bold text-forest">Quand voulez-vous rouler ?</h2>
          <DurationPicker today={today} slots={slots} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-4xl font-bold text-forest">Avec quels vélos ?</h2>
          {catalog.types.length === 0 && (
            <p className="rounded-xl2 bg-white p-4">Aucun vélo n'est encore proposé ici. Revenez bientôt ou appelez-nous au 06 44 80 71 89.</p>
          )}
          {catalog.types.map((t) => (
            <BikeCard
              key={t.id}
              code={t.code}
              label={t.label}
              sizes={t.sizes}
              electric={t.code === "electric"}
              fromPrice={euros(t.price_from_three_days_cents)}
              halfDay={euros(t.half_day_price_cents)}
              day={euros(t.daily_price_cents)}
              twoDays={euros(t.two_days_price_cents)}
              threePlus={euros(t.price_from_three_days_cents)}
              deposit={euros(t.deposit_cents)}
            />
          ))}
          <p className="text-sm text-charcoal">Casque et antivol inclus.</p>
          {catalog.accessories.length > 0 && (
            <>
              <h3 className="mt-2 font-display text-3xl font-bold text-forest">Des accessoires ? <span className="text-xl font-normal text-charcoal">(facultatif)</span></h3>
              {catalog.accessories.map((a) => (
                <AccessoryStepper key={a.id} code={a.code} label={a.label} price={euros(a.daily_price_cents)} max={a.stock} />
              ))}
            </>
          )}
        </section>
        </div>

        <div className="lg:sticky lg:top-6 lg:col-span-2">
        <section className="flex flex-col gap-3 rounded-xl2 border border-line bg-white p-5 shadow-sm">
          <h2 className="font-display text-4xl font-bold text-forest">Qui roule ?</h2>
          <p className="text-sm text-charcoal">{counter ? "Vous recevrez la confirmation par e-mail. Vos vélos sont à retirer à la boutique." : "Vous recevrez la confirmation et le code d'accès par e-mail."}</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">Prénom<input name="first_name" required autoComplete="given-name" className={input} /></label>
            <label className="flex flex-col gap-1 text-sm">Nom<input name="last_name" required autoComplete="family-name" className={input} /></label>
          </div>
          <label className="flex flex-col gap-1 text-sm">E-mail<input type="email" name="email" required autoComplete="email" className={input} /></label>
          <label className="flex flex-col gap-1 text-sm">Téléphone<input type="tel" name="phone" required autoComplete="tel" className={input} /></label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="accept_terms" required className="mt-1 h-5 w-5" />
            <span>J'accepte les <a href="/conditions" target="_blank" className="underline">conditions de location</a> et la <a href="/confidentialite" target="_blank" className="underline">politique de confidentialité</a>.</span>
          </label>
          <Button type="submit" className="w-full">Continuer</Button>
          <p className="text-center text-xs text-charcoal/80">Vous vérifiez le récapitulatif avant tout paiement.</p>
        </section>
        </div>
      </form>
      <AccommodationReviews accommodationId={acc.id} />
      <Itineraries slug={slug} latitude={acc.latitude} longitude={acc.longitude} />
    </main>
    </>
  );
}

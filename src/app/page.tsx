import { Reviews } from "@/components/Reviews";
import { SiteHeader } from "@/components/SiteHeader";
import { PHOTOS } from "@/lib/photos";
import { PartnersSection } from "@/components/PartnersSection";

export const metadata = {
  title: "Chez Léon Bike & Stay – vélos en libre-service en Touraine",
  description: "Louez un vélo en libre-service depuis votre hébergement en Touraine : scannez le QR code, réservez, payez, récupérez votre vélo.",
};

const steps = [
  { n: "1", title: "Scannez", text: "Le QR code est affiché dans votre hébergement." },
  { n: "2", title: "Réservez", text: "Choisissez vos dates et votre vélo, classique ou électrique, et payez en ligne depuis votre téléphone." },
  { n: "3", title: "Partez", text: "Récupérez votre vélo en libre-service avec votre code d'accès. Casque et antivol inclus." },
];

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <section
        className="bg-gradient-to-b from-[#6c7f45] to-sage bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(47,61,25,0.2) 0%, rgba(47,61,25,0.78) 100%), url(${PHOTOS.veloColza})` }}
      >
        <div className="mx-auto flex max-w-5xl flex-col px-6 pb-8 pt-40 md:pb-14 md:pt-64">
          <h1 className="max-w-3xl text-6xl font-bold leading-[0.95] text-white md:text-8xl">Des vélos pour explorer la Touraine</h1>
          <p className="mt-3 text-white">
            Chez Léon Bike &amp; Stay : la location de vélos en libre-service, directement depuis votre hébergement, sur l'itinéraire de la Loire à Vélo.
          </p>
        </div>
      </section>

      <main className="mx-auto flex max-w-5xl flex-col gap-10 p-6 md:gap-14">
        <PartnersSection />

        <section id="comment" className="scroll-mt-24">
          <h2 className="mb-3 font-display text-4xl font-bold text-forest">Comment ça marche</h2>
          <ol className="grid gap-3 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-4 rounded-xl2 border border-line bg-white p-4 md:flex-col">
                <span aria-hidden="true" className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sage font-display text-2xl font-bold text-white">{s.n}</span>
                <div>
                  <p className="font-bold text-forest">{s.title}</p>
                  <p className="text-sm">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm">Une caution par empreinte bancaire est demandée avant le retrait : rien n'est débité.</p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
        <section className="overflow-hidden rounded-xl2 border border-line bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.velosChezLeon} alt="Deux vélos Chez Léon appuyés à un muret au bord d'un canal" className="h-48 w-full object-cover md:h-64" />
          <p className="p-4 text-sm">Des vélos prêts à partir, classiques ou à assistance électrique.</p>
        </section>

        <section className="overflow-hidden rounded-xl2 border border-line bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.savonnieres} alt="Panneau d'entrée de Savonnières, au bord du Cher" className="h-48 w-full object-cover md:h-64" />
          <p className="p-4 text-sm">Chez Léon est installé à Savonnières, en Touraine, au cœur du Val de Loire.</p>
        </section>

        </div>

        <Reviews />

        <section id="hebergeurs" className="scroll-mt-24 rounded-xl2 bg-accent p-5 text-forest">
          <h2 className="font-display text-4xl font-bold">Vous accueillez des voyageurs ?</h2>
          <p className="mt-2 text-sm">
            Campings, gîtes, hôtels, chambres d'hôtes : proposez des vélos à vos clients sans rien gérer, ni réservation, ni encaissement.
            Votre établissement a sa propre page et son QR code.
          </p>
          <p className="mt-3 text-sm">
            <a className="font-bold underline" href="mailto:reservationschezleon@gmail.com">reservationschezleon@gmail.com</a>
            {" · "}<a className="underline" href="tel:+33644807189">06 44 80 71 89</a>
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <a href="https://chezleonlocation.com" className="inline-flex min-h-12 items-center justify-center rounded-xl2 border border-forest/30 bg-accent px-6 font-button font-bold text-forest hover:bg-[#dfc89f]">
            Découvrir Chez Léon
          </a>
        </section>

        <footer className="flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-4 text-sm">
          <a className="underline" href="/conditions">Conditions de location</a>
          <a className="underline" href="/confidentialite">Confidentialité</a>
          <a className="underline" href="/mentions-legales">Mentions légales</a>
          <a className="underline" href="/login">Espace hébergeur et administration</a>
          <a className="underline" href="/demo">Démonstration</a>
        </footer>
      </main>
    </>
  );
}

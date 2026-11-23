import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Guide de prise en main – Chez Léon Bike & Stay",
  description: "Découvrez comment fonctionne le service de vélos en libre-service Chez Léon Bike & Stay, côté hébergeur et côté client.",
  robots: { index: false, follow: false },
};

const CLIENT_STEPS = [
  ["Il scanne le QR code", "Affiché dans votre établissement, il s'ouvre avec l'appareil photo du téléphone. Rien à installer."],
  ["Il choisit ses vélos", "Il indique ses dates et le type de vélo (électrique ou classique). Les prix sont affichés avant de payer."],
  ["Il paie en ligne", "Le paiement se fait par carte sur une page sécurisée. Une caution (empreinte bancaire, pas un débit) est demandée avant le retrait."],
  ["Il récupère les vélos seul", "Il reçoit son accès après la réservation et retire les vélos à l'heure prévue, sans que vous ayez à être là."],
  ["Il ramène les vélos", "Au retour, il le déclare. Vous confirmez en un clic et la caution est libérée une fois les vélos contrôlés."],
];

const HOST_ITEMS = [
  ["Votre commission", "Un pourcentage de chaque location réalisée dans votre établissement, calculé et affiché pour vous."],
  ["Une jauge d'estimation", "Vous déplacez un curseur pour simuler un nombre de locations par mois et voir ce que cela représente. C'est une projection indicative, pas un engagement de revenus."],
  ["Votre QR code", "Prêt à imprimer pour votre accueil, votre livret d'accueil ou vos affiches. Téléchargeable en PNG ou en SVG."],
  ["Vos vélos", "La liste des vélos de votre établissement et leur état : disponible, réservé, en location, en maintenance."],
  ["Vos réservations", "Les locations à venir et passées, avec un bouton pour déclarer le retour des vélos."],
];

const NOT_HOST = [
  "Encaisser : le paiement et la caution se font en ligne.",
  "Remettre les clés ou accueillir les cyclistes : ils retirent les vélos en autonomie.",
  "Entretenir les vélos : Chez Léon les contrôle et les remet en état.",
];

export default function GuideHebergeur() {
  return (
    <>
      <div className="mx-auto max-w-5xl"><SiteHeader /></div>
      <main className="mx-auto flex max-w-3xl flex-col gap-10 p-6">
        <header>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-forest">Guide de prise en main</p>
          <h1 className="text-5xl font-bold text-forest md:text-6xl">Chez Léon Bike &amp; Stay</h1>
          <p className="mt-3 max-w-2xl text-lg">
            Un service de vélos en libre-service pour vos hôtes, sur la Loire à Vélo. Vous mettez à disposition un QR code, vos clients réservent seuls,
            et vous touchez une commission sur chaque location. Voici comment ça marche, en quelques minutes.
          </p>
        </header>

        <section aria-labelledby="client" className="flex flex-col gap-4">
          <h2 id="client" className="font-display text-4xl font-bold text-forest">Le parcours de vos hôtes</h2>
          <ol className="flex flex-col gap-3">
            {CLIENT_STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-3 rounded-xl2 border border-line bg-white p-4">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest font-bold text-white">{i + 1}</span>
                <span><strong>{title}.</strong> {text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="hote" className="flex flex-col gap-4">
          <h2 id="hote" className="font-display text-4xl font-bold text-forest">Votre espace hébergeur</h2>
          <p>Vous y trouvez, en un coup d&apos;œil :</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {HOST_ITEMS.map(([title, text]) => (
              <li key={title} className="rounded-xl2 border border-line bg-white p-4">
                <p className="font-medium text-forest">{title}</p>
                <p className="mt-1 text-sm">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="pas" className="rounded-xl2 bg-sage/20 p-5">
          <h2 id="pas" className="mb-2 font-display text-3xl font-bold text-forest">Ce que vous n&apos;avez pas à faire</h2>
          <ul className="list-disc pl-5">
            {NOT_HOST.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </section>

        <section aria-labelledby="voir" className="flex flex-col gap-4">
          <h2 id="voir" className="font-display text-4xl font-bold text-forest">Découvrez-le vous-même</h2>
          <p>Deux démonstrations, sans mot de passe et avec des données fictives : vous ne pouvez rien casser.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/demo/partner" className="rounded-xl2 border border-line bg-white p-5 hover:bg-sage/20">
              <span className="font-display text-3xl font-bold text-forest">Côté hébergeur</span>
              <span className="mt-1 block text-sm">L&apos;espace d&apos;un camping d&apos;exemple : commission, jauge, QR code, vélos et réservations.</span>
            </Link>
            <Link href="/h/demo-camping-cher" className="rounded-xl2 border border-line bg-white p-5 hover:bg-sage/20">
              <span className="font-display text-3xl font-bold text-forest">Côté client</span>
              <span className="mt-1 block text-sm">La page de réservation qu&apos;ouvre le vacancier en scannant le QR code.</span>
            </Link>
          </div>
        </section>

        <section aria-labelledby="questions" className="rounded-xl2 border border-line bg-white p-5">
          <h2 id="questions" className="mb-2 font-display text-3xl font-bold text-forest">Une question ?</h2>
          <p>
            Répondez simplement au message qui vous a transmis ce guide : je vous réponds rapidement. Vos remarques m&apos;aident aussi à améliorer le
            service avant la saison.
          </p>
          <p className="mt-3 text-sm text-charcoal/70">Antoine, Chez Léon – location de vélos à Savonnières.</p>
        </section>
      </main>
    </>
  );
}

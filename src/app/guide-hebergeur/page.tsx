import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Guide de prise en main – Chez Léon Bike & Stay",
  description: "Découvrez comment fonctionne le service de vélos en libre-service Chez Léon Bike & Stay, côté hébergeur et côté client.",
  robots: { index: false, follow: false },
};

/** Petites illustrations (traits simples, couleur du site) pour chaque étape du parcours client. */
const ICONS: Record<string, React.ReactNode> = {
  qr: (<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1" /></>),
  bike: (<><circle cx="5.5" cy="17" r="3.5" /><circle cx="18.5" cy="17" r="3.5" /><path d="M5.5 17l4-8h5l4 8M9.5 9L12 17M14 6h3" /></>),
  card: (<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>),
  key: (<><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M16 7l3 3M14 9l2 2" /></>),
  back: (<><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 010 12h-3" /></>),
};
const Icon = ({ name }: { name: string }) => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-forest">
    {ICONS[name]}
  </svg>
);

const CLIENT_STEPS: [string, string, string][] = [
  ["qr", "Il scanne le QR code", "Affiché dans votre établissement, il s'ouvre avec l'appareil photo du téléphone. Rien à installer."],
  ["bike", "Il choisit ses vélos", "Il indique ses dates et le type de vélo (électrique ou classique). Les prix sont affichés avant de payer."],
  ["card", "Il paie en ligne", "Le paiement se fait par carte sur une page sécurisée. Une caution (empreinte bancaire, pas un débit) est demandée avant le retrait."],
  ["key", "Il récupère les vélos seul", "Il reçoit son accès après la réservation et retire les vélos à l'heure prévue, sans que vous ayez à être là."],
  ["back", "Il ramène les vélos", "Au retour, il le déclare. Vous confirmez en un clic et la caution est libérée une fois les vélos contrôlés."],
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
        <figure className="overflow-hidden rounded-xl2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photos/velos-chez-leon.jpg" alt="Deux vélos électriques Chez Léon posés contre un muret en pierre, au bord d'un canal en Touraine" width={1400} height={783} className="h-56 w-full object-cover sm:h-72" />
        </figure>

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
            {CLIENT_STEPS.map(([icon, title, text], i) => (
              <li key={title} className="flex items-center gap-3 rounded-xl2 border border-line bg-white p-4">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest font-bold text-white">{i + 1}</span>
                <Icon name={icon} />
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

        <section aria-labelledby="pas" className="grid items-center gap-5 rounded-xl2 bg-sage/20 p-5 sm:grid-cols-[1fr_220px]">
          <div>
            <h2 id="pas" className="mb-2 font-display text-3xl font-bold text-forest">Ce que vous n&apos;avez pas à faire</h2>
            <ul className="list-disc pl-5">
              {NOT_HOST.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photos/velo-colza.jpg" alt="Cadre d'un vélo Chez Léon au milieu d'un champ de colza en fleur" width={1400} height={1120} loading="lazy" className="h-48 w-full rounded-xl2 object-cover sm:h-56" />
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

        <section aria-labelledby="questions" className="grid items-center gap-5 rounded-xl2 border border-line bg-white p-5 sm:grid-cols-[110px_1fr]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/snookie/snookie.png" alt="Snookie, la mascotte de Chez Léon, un chien qui tient un micro" width={350} height={438} loading="lazy" className="mx-auto h-32 w-auto" />
          <div>
            <h2 id="questions" className="mb-2 font-display text-3xl font-bold text-forest">Une question ?</h2>
            <p>
              Répondez simplement au message qui vous a transmis ce guide : je vous réponds rapidement. Vos remarques m&apos;aident aussi à améliorer le
              service avant la saison.
            </p>
            <p className="mt-3 text-sm text-charcoal/70">Antoine, Chez Léon – location de vélos à Savonnières.</p>
          </div>
        </section>

        <figure className="overflow-hidden rounded-xl2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photos/savonnieres.jpg" alt="Panneau de la commune de Savonnières, au bord d'un chemin de campagne, là où Chez Léon est installé" width={1200} height={800} loading="lazy" className="h-48 w-full object-cover sm:h-64" />
          <figcaption className="bg-white p-3 text-center text-sm text-charcoal/70">Savonnières, en Touraine : là où Chez Léon est installé.</figcaption>
        </figure>
      </main>
    </>
  );
}

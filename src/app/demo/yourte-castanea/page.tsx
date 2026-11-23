import QRCode from "qrcode";
import { euros } from "@/lib/format";
import { commissionCents } from "@/lib/pricing";
import CommissionGauge from "@/components/partner/CommissionGauge";
import { ACCOMMODATION_PHOTOS } from "@/lib/photos";

/**
 * Démo personnalisée pour la Yourte Castanea : son nom, sa photo, ses vrais tarifs (20 %, 4 vélos électriques,
 * 4 vélos classiques) et son vrai QR code. Les réservations et les clients sont FICTIFS.
 */
const SLUG = "yourte-castanea";
const NAME = "Yourte Castanea";
const BPS = 2000;
const PRICE = { electric: 3600, classic: 1900 };

const BIKES = [
  { code: "ELEC-001", type: "Vélo électrique", status: "Disponible" },
  { code: "ELEC-002", type: "Vélo électrique", status: "En location" },
  { code: "ELEC-003", type: "Vélo électrique", status: "Disponible" },
  { code: "ELEC-004", type: "Vélo électrique", status: "Disponible" },
  { code: "CLASS-001", type: "Vélo classique", status: "Disponible" },
  { code: "CLASS-002", type: "Vélo classique", status: "Réservé" },
  { code: "CLASS-003", type: "Vélo classique", status: "Disponible" },
  { code: "CLASS-004", type: "Vélo classique", status: "Disponible" },
];

const RESERVATIONS = [
  { number: "CL-DEMO-0103", when: "samedi 12 juin 2027 à 09:00", status: "Retour déclaré", total: 5500, note: "Dans l'espace réel, vous déclarez ici le retour des vélos : un clic." },
  { number: "CL-DEMO-0102", when: "samedi 12 juin 2027 à 09:00", status: "En cours", total: 3600 },
  { number: "CL-DEMO-0101", when: "lundi 14 juin 2027 à 09:00", status: "Confirmée", total: 7200 },
  { number: "CL-DEMO-0100", when: "jeudi 3 juin 2027 à 09:00", status: "Terminée", total: 5500 },
];

const STEPS = [
  ["Regardez votre commission", "Elle s'affiche en haut : 20 % de chaque location, sur les réservations confirmées ou terminées."],
  ["Essayez la jauge", "Déplacez les curseurs pour estimer vos gains selon le nombre de locations par mois."],
  ["Récupérez votre QR code", "C'est le vôtre, il fonctionne déjà. Imprimez-le et affichez-le à l'accueil ou dans la yourte."],
  ["Suivez vos vélos", "Chaque vélo a un état : disponible, réservé, en location, en maintenance."],
  ["Déclarez les retours", "Quand vos hôtes ramènent les vélos, un bouton apparaît : cliquez, c'est tout."],
];

export default async function DemoYourte() {
  const photo = ACCOMMODATION_PHOTOS[SLUG];
  const commission = RESERVATIONS.filter((r) => r.status !== "En attente").reduce((s, r) => s + commissionCents(r.total, BPS), 0);
  const qr = await QRCode.toDataURL(`https://bike.chezleonlocation.com/h/${SLUG}`, { width: 320, margin: 2, errorCorrectionLevel: "M" });

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <div
        className="rounded-xl2 bg-forest p-6 text-white"
        style={photo ? { backgroundImage: `linear-gradient(180deg, rgba(47,61,25,0.35) 0%, rgba(47,61,25,0.85) 100%), url(${photo})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        <p className="mb-2 text-sm font-bold uppercase tracking-wide">Démo préparée pour vous</p>
        <h1 className="text-5xl font-bold">{NAME}</h1>
        <p className="mt-2 max-w-xl">
          Voici votre espace hébergeur tel que vous le verrez. Vos tarifs, votre commission et votre QR code sont les vôtres.
          Les clients et les réservations sont inventés : cliquez partout, vous ne pouvez rien casser.
        </p>
      </div>

      <div className="rounded-xl2 border border-line bg-white p-5">
        <h2 className="mb-3 font-display text-3xl font-bold text-forest">Prise en main en 5 étapes</h2>
        <ol className="flex flex-col gap-3">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="flex gap-3">
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest font-bold text-white">{i + 1}</span>
              <span><strong>{title}.</strong> {text}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl2 border border-line bg-white p-4">
        <p className="text-sm">Commission estimée sur les réservations de l&apos;exemple</p>
        <p className="text-3xl font-bold">{euros(commission)}</p>
        <p className="text-sm text-charcoal/70">Estimation indicative. Le versement réel passe par Stripe Connect.</p>
      </div>

      <CommissionGauge
        commissionBps={BPS}
        types={[
          { code: "electric", label: "Vélo électrique", dailyCents: PRICE.electric, bikes: 4 },
          { code: "classic", label: "Vélo classique", dailyCents: PRICE.classic, bikes: 4 },
        ]}
        realRentals={RESERVATIONS.length}
        realCommissionCents={commission}
      />

      <div className="rounded-xl2 border border-line bg-white p-4">
        <h2 className="mb-2 font-display text-3xl font-bold text-forest">Votre QR code</h2>
        <p className="mb-3 text-sm">Affichez-le à l&apos;accueil ou dans la yourte : vos hôtes le scannent avec l&apos;appareil photo de leur téléphone pour réserver un vélo.</p>
        <div className="flex flex-wrap items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Votre QR code de réservation" width={160} height={160} className="h-40 w-40" />
          <div className="flex flex-col gap-2 text-sm">
            <a className="underline" href={`/h/${SLUG}`} target="_blank" rel="noreferrer">Voir la page que vos hôtes verront</a>
            <span className="text-charcoal/70">Téléchargeable en PNG ou en SVG dans votre espace réel.</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Vos vélos</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {BIKES.map((b) => (
            <li key={b.code} className="flex justify-between rounded-xl2 border border-line bg-white p-3"><span>{b.code} · {b.type}</span><span>{b.status}</span></li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Réservations (exemples)</h2>
        <ul className="flex flex-col gap-2">
          {RESERVATIONS.map((r) => (
            <li key={r.number} className="rounded-xl2 border border-line bg-white p-3">
              <span className="font-medium">{r.number}</span> · {r.when} · {r.status}
              {r.note && <p className="mt-1 text-sm text-charcoal/70">{r.note}</p>}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl2 bg-sage/20 p-4 text-sm">
        <p className="font-medium text-forest">Et ensuite ?</p>
        <p>
          Votre espace réel se trouve sur <a className="underline" href="/login">la page de connexion</a>, avec votre adresse e-mail et le mot de passe temporaire reçu par SMS.
          Pensez à le changer dès la première connexion.
        </p>
      </div>
    </section>
  );
}

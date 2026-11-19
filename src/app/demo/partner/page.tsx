import QRCode from "qrcode";
import { DEMO_BIKES, DEMO_RESERVATIONS } from "@/lib/demo/data";
import { euros } from "@/lib/format";
import CommissionGauge from "@/components/partner/CommissionGauge";

const ACC = "Camping des Rives (exemple)";

export default async function DemoPartner() {
  const bikes = DEMO_BIKES.filter((b) => b.acc === ACC);
  const reservations = DEMO_RESERVATIONS.filter((r) => r.acc === ACC);
  const commission = reservations.filter((r) => ["Confirmée", "Prête", "En cours", "Retour déclaré", "Terminée"].includes(r.status)).reduce((s, r) => s + Math.round(r.total * 0.2), 0);
  const qr = await QRCode.toDataURL("https://bike.chezleonlocation.com/h/demo-camping-cher", { width: 320, margin: 2, errorCorrectionLevel: "M" });

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <div>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-forest">Espace hébergeur</p>
        <h1 className="text-5xl font-bold text-forest">Espace partenaire</h1>
        <p>{ACC}</p>
      </div>

      <div className="rounded-xl2 border border-line bg-white p-4">
        <p className="text-sm">Commission estimée sur les réservations confirmées ou terminées</p>
        <p className="text-3xl font-bold">{euros(commission)}</p>
        <p className="text-sm text-charcoal/70">Estimation indicative. Le versement réel passe par Stripe Connect.</p>
      </div>

      <CommissionGauge
        commissionBps={2000}
        types={[
          { code: "electric", label: "Vélo électrique", dailyCents: 3600, bikes: bikes.filter((b) => b.type === "Vélo électrique").length },
          { code: "classic", label: "Vélo classique", dailyCents: 1900, bikes: bikes.filter((b) => b.type === "Vélo classique").length },
        ]}
        realRentals={reservations.length}
        realCommissionCents={commission}
      />

      <div className="rounded-xl2 border border-line bg-white p-4">
        <h2 className="mb-2 font-display text-3xl font-bold text-forest">Votre QR code</h2>
        <p className="mb-3 text-sm">Affichez-le à l'accueil ou dans vos hébergements : vos clients le scannent pour réserver un vélo.</p>
        <div className="flex flex-wrap items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code de réservation (exemple)" width={160} height={160} className="h-40 w-40" />
          <p className="text-sm">Téléchargeable en PNG ou en SVG dans l'espace réel.</p>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Vélos de votre établissement</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {bikes.map((b) => (
            <li key={b.code} className="flex justify-between rounded-xl2 border border-line bg-white p-3"><span>{b.code} · {b.type}</span><span>{b.status}</span></li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Réservations</h2>
        <ul className="flex flex-col gap-2">
          {reservations.map((r) => (
            <li key={r.number} className="rounded-xl2 border border-line bg-white p-3">
              <span className="font-medium">{r.number}</span> · {r.start} · {r.status}
              {r.status === "Retour déclaré" && <p className="mt-1 text-sm text-charcoal/70">Dans l'espace réel, l'hébergeur déclare ici le retour des vélos.</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

"use client";

import { useId, useState } from "react";
import { euros } from "@/lib/format";

export type GaugeType = { code: string; label: string; dailyCents: number; bikes: number };

type Props = {
  commissionBps: number;
  types: GaugeType[];
  /** Chiffres réels de l'hébergement, pour se comparer à sa projection. */
  realRentals: number;
  realCommissionCents: number;
};

const START = 10;
const MAX = 120;

/** Même arrondi que le versement réel : commission par location, au centime inférieur. */
const perRental = (dailyCents: number, bps: number) => Math.floor((dailyCents * bps) / 10000);

export default function CommissionGauge({ commissionBps, types, realRentals, realCommissionCents }: Props) {
  const baseId = useId();
  const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries(types.map((t) => [t.code, START])));

  if (types.length === 0) return null;

  const rows = types.map((t) => {
    const n = counts[t.code] ?? 0;
    const each = perRental(t.dailyCents, commissionBps);
    return { ...t, n, each, gross: n * t.dailyCents, commission: n * each };
  });
  const totalRentals = rows.reduce((s, r) => s + r.n, 0);
  const totalGross = rows.reduce((s, r) => s + r.gross, 0);
  const totalCommission = rows.reduce((s, r) => s + r.commission, 0);

  return (
    <div className="rounded-xl2 border border-line bg-white p-4">
      <h2 className="mb-1 font-display text-3xl font-bold text-forest">Estimez votre commission</h2>
      <p className="mb-4 text-sm">Déplacez la jauge selon le nombre de locations que vous imaginez sur la saison.</p>

      <div className="flex flex-col gap-5">
        {rows.map((r) => {
          const id = `${baseId}-${r.code}`;
          return (
            <div key={r.code}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <label htmlFor={id} className="font-medium">{r.label}</label>
                <span className="text-sm text-charcoal/70">{euros(r.dailyCents)} la journée · {euros(r.each)} pour vous</span>
              </div>
              <input
                id={id}
                type="range"
                min={0}
                max={MAX}
                step={1}
                value={r.n}
                onChange={(e) => setCounts((c) => ({ ...c, [r.code]: Number(e.target.value) }))}
                aria-valuetext={`${r.n} location${r.n > 1 ? "s" : ""}`}
                className="h-2 w-full cursor-pointer accent-forest"
              />
              <div className="mt-1 flex justify-between text-xs text-charcoal/70">
                <span>0</span>
                <span className="font-medium text-charcoal">{r.n} location{r.n > 1 ? "s" : ""}</span>
                <span>{MAX}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl2 bg-cream p-4" aria-live="polite">
        <p className="text-sm">Commission estimée pour {totalRentals} location{totalRentals > 1 ? "s" : ""}</p>
        <p className="text-4xl font-bold text-forest">{euros(totalCommission)}</p>
        <p className="mt-1 text-sm text-charcoal/70">Sur {euros(totalGross)} de locations, au taux de {commissionBps / 100} %.</p>
      </div>

      <p className="mt-3 text-sm">
        Pour comparer : depuis le début, {realRentals} réservation{realRentals > 1 ? "s" : ""} confirmée{realRentals > 1 ? "s" : ""} ou terminée{realRentals > 1 ? "s" : ""} représente{realRentals > 1 ? "nt" : ""} {euros(realCommissionCents)} de commission.
      </p>
      <p className="mt-2 text-xs text-charcoal/70">
        Estimation indicative, calculée au tarif à la journée, sans sacoches ni tarifs dégressifs. Ce n'est pas un engagement de revenus. Le versement réel passe par Stripe Connect une fois la location terminée.
      </p>
    </div>
  );
}

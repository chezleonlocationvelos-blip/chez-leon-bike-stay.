"use client";
import { useState } from "react";

type Props = {
  code: string; label: string; electric: boolean;
  fromPrice: string; halfDay: string; day: string; twoDays: string; threePlus: string; deposit: string;
  onTotalChange?: (delta: number) => void;
};

/** Carte vélo avec compteur − / + (champ qty_<code> envoyé avec le formulaire). */
export function BikeCard(p: Props) {
  const [qty, setQty] = useState(0);
  const set = (n: number) => setQty(Math.max(0, Math.min(10, n)));
  const btn = "flex h-11 w-11 items-center justify-center rounded-full border border-forest text-xl font-bold text-forest transition hover:bg-sage/20 disabled:opacity-30";

  return (
    <div className={`rounded-xl2 border bg-white p-4 transition ${qty > 0 ? "border-forest ring-1 ring-forest" : "border-line"}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-bold text-forest">{p.label}</div>
          <div className="text-sm text-charcoal">à partir de <strong>{p.fromPrice}</strong> par jour</div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className={btn} onClick={() => set(qty - 1)} disabled={qty === 0} aria-label={`Retirer un ${p.label}`}>−</button>
          <span className="w-6 text-center text-lg font-bold" aria-live="polite">{qty}</span>
          <button type="button" className={btn} onClick={() => set(qty + 1)} disabled={qty === 10} aria-label={`Ajouter un ${p.label}`}>+</button>
        </div>
      </div>
      <input type="hidden" name={`qty_${p.code}`} value={qty} />
      <details className="mt-2 text-sm text-charcoal">
        <summary className="cursor-pointer text-forest underline">Tarifs et caution</summary>
        <ul className="mt-2 flex flex-col gap-0.5">
          <li>Demi-journée : {p.halfDay}</li>
          <li>1 jour : {p.day} · 2 jours : {p.twoDays}</li>
          <li>Dès 3 jours : {p.threePlus} par jour</li>
          <li>Caution : {p.deposit} par vélo (empreinte bancaire, non débitée)</li>
        </ul>
      </details>
    </div>
  );
}

"use client";
import { useState } from "react";

/** Option sacoches : interrupteur simple puis compteur. */
export function PannierStepper({ price }: { price: string }) {
  const [qty, setQty] = useState(0);
  const set = (n: number) => setQty(Math.max(0, Math.min(4, n)));
  const btn = "flex h-10 w-10 items-center justify-center rounded-full border border-forest text-lg font-bold text-forest transition hover:bg-sage/20 disabled:opacity-30";
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl2 border border-dashed border-line bg-white/60 p-4">
      <div>
        <div className="font-bold text-forest">Sacoches <span className="font-normal text-charcoal">(facultatif)</span></div>
        <div className="text-sm text-charcoal">{price} par sacoche et par jour</div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={btn} onClick={() => set(qty - 1)} disabled={qty === 0} aria-label="Retirer une sacoche">−</button>
        <span className="w-5 text-center font-bold" aria-live="polite">{qty}</span>
        <button type="button" className={btn} onClick={() => set(qty + 1)} disabled={qty === 4} aria-label="Ajouter une sacoche">+</button>
      </div>
      <input type="hidden" name="panniers" value={qty} />
    </div>
  );
}

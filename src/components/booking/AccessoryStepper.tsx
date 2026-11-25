"use client";
import { useState } from "react";
import { accessoryField } from "@/lib/reservations/fields";

const HINTS: Record<string, string> = {
  pannier: "Pour emporter pique-nique et affaires",
  phone_holder: "Votre GPS sous les yeux, au guidon",
  child_trailer: "Pour emmener les plus petits",
  baby_seat: "Siège porte-bébé fixé sur le vélo adulte",
  girafe: "Demi-vélo accroché au vôtre : l'enfant pédale en toute sécurité",
};

/** Accessoire facultatif avec compteur (champ acc_<code>), plafonné au stock du point de location. */
export function AccessoryStepper({ code, label, price, max }: { code: string; label: string; price: string; max: number }) {
  const [qty, setQty] = useState(0);
  const limit = Math.min(max, 10);
  const set = (n: number) => setQty(Math.max(0, Math.min(limit, n)));
  const btn = "flex h-10 w-10 items-center justify-center rounded-full border border-forest text-lg font-bold text-forest transition hover:bg-sage/20 disabled:opacity-30";
  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl2 border bg-white/60 p-4 ${qty > 0 ? "border-forest" : "border-dashed border-line"}`}>
      <div>
        <div className="font-bold text-forest">{label}</div>
        <div className="text-sm text-charcoal">{price} par jour{HINTS[code] ? ` · ${HINTS[code]}` : ""}</div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={btn} onClick={() => set(qty - 1)} disabled={qty === 0} aria-label={`Retirer : ${label}`}>−</button>
        <span className="w-5 text-center font-bold" aria-live="polite">{qty}</span>
        <button type="button" className={btn} onClick={() => set(qty + 1)} disabled={qty >= limit} aria-label={`Ajouter : ${label}`}>+</button>
      </div>
      <input type="hidden" name={accessoryField(code)} value={qty} />
    </div>
  );
}

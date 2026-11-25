"use client";
import { useState } from "react";
import { qtyField } from "@/lib/reservations/fields";

type Props = {
  code: string; label: string; electric: boolean;
  /** Tailles proposées ; vide = taille unique (un seul compteur). */
  sizes?: string[];
  fromPrice: string; halfDay: string; day: string; twoDays: string; threePlus: string; deposit: string;
};

const btn = "flex h-11 w-11 items-center justify-center rounded-full border border-forest text-xl font-bold text-forest transition hover:bg-sage/20 disabled:opacity-30";

function Stepper({ name, label, sub, onChange }: { name: string; label: string; sub?: string; onChange: (n: number) => void }) {
  const [qty, setQty] = useState(0);
  const set = (n: number) => { const v = Math.max(0, Math.min(10, n)); setQty(v); onChange(v); };
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="font-bold text-forest">{label}</div>
        {sub && <div className="text-xs text-charcoal/80">{sub}</div>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={btn} onClick={() => set(qty - 1)} disabled={qty === 0} aria-label={`Retirer : ${label}`}>−</button>
        <span className="w-6 text-center text-lg font-bold" aria-live="polite">{qty}</span>
        <button type="button" className={btn} onClick={() => set(qty + 1)} disabled={qty === 10} aria-label={`Ajouter : ${label}`}>+</button>
      </div>
      <input type="hidden" name={name} value={qty} />
    </div>
  );
}

/** Carte d'un type de vélo : un compteur − / + par taille (ou un seul si taille unique). */
export function BikeCard(p: Props) {
  const sizes = p.sizes ?? [];
  const [counts, setCounts] = useState<Record<string, number>>({});
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const track = (key: string) => (n: number) => setCounts((c) => ({ ...c, [key]: n }));

  return (
    <div className={`rounded-xl2 border bg-white p-4 transition ${total > 0 ? "border-forest ring-1 ring-forest" : "border-line"}`}>
      {sizes.length === 0 ? (
        <Stepper name={qtyField(p.code, null)} label={p.label} sub={`à partir de ${p.fromPrice} par jour`} onChange={track("_")} />
      ) : (
        <>
          <div className="text-lg font-bold text-forest">{p.label}</div>
          <div className="mb-3 text-sm text-charcoal">à partir de <strong>{p.fromPrice}</strong> par jour · choisissez la taille</div>
          <div className="flex flex-col gap-3 border-t border-line pt-3">
            {sizes.map((s) => (
              <Stepper key={s} name={qtyField(p.code, s)} label={`Taille ${s}`} onChange={track(s)} />
            ))}
          </div>
        </>
      )}
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

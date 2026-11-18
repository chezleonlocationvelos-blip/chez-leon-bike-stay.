"use client";
import { useState } from "react";

const LABELS = ["", "Décevant", "Moyen", "Bien", "Très bien", "Excellent"];

/** Sélecteur de note 1–5 (champ « rating »). */
export function StarRating() {
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div>
      <div role="radiogroup" aria-label="Note sur 5" className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer text-4xl leading-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sage" onMouseEnter={() => setHover(n)}>
            <input type="radio" name="rating" value={n} required checked={value === n} onChange={() => setValue(n)} className="sr-only" />
            <span aria-hidden="true" className={n <= shown ? "text-forest" : "text-line"}>★</span>
            <span className="sr-only">{n} sur 5</span>
          </label>
        ))}
      </div>
      <p className="mt-1 h-5 text-sm text-charcoal" aria-live="polite">{LABELS[shown]}</p>
    </div>
  );
}

"use client";
import { useState } from "react";

type Slot = { id: string; start: string; end: string };
const field = "min-h-12 w-full rounded-xl2 border border-line bg-white px-4";

/** Choix de la durée : bascule « Journée(s) » / « Demi-journée » ; ne montre que les champs utiles. */
export function DurationPicker({ today, slots }: { today: string; slots: Slot[] }) {
  const [mode, setMode] = useState<"days" | "half_day">("days");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);

  const tab = (value: "days" | "half_day", label: string, hint: string) => (
    <label
      className={`flex cursor-pointer flex-col rounded-xl2 border px-4 py-3 text-center transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sage ${
        mode === value ? "border-forest bg-forest text-white" : "border-line bg-white text-forest hover:bg-sage/10"
      }`}
    >
      <input type="radio" name="mode" value={value} checked={mode === value} onChange={() => setMode(value)} className="sr-only" />
      <span className="font-bold">{label}</span>
      <span className={`text-xs ${mode === value ? "text-white/80" : "text-charcoal/70"}`}>{hint}</span>
    </label>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {tab("days", "À la journée", "9h00 – 18h30")}
        {tab("half_day", "Demi-journée", "4 heures")}
      </div>

      <div className={mode === "days" ? "grid grid-cols-2 gap-3" : "hidden"}>
        <label className="flex flex-col gap-1 text-sm text-charcoal">Je pars le
          <input
            type="date" name="start_date" min={today} value={start} className={field}
            onChange={(e) => { setStart(e.target.value); if (e.target.value > end) setEnd(e.target.value); }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-charcoal">Je rends le vélo le <span className="sr-only">(inclus)</span>
          <input type="date" name="end_date" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} className={field} />
        </label>
      </div>

      <div className={mode === "half_day" ? "grid grid-cols-2 gap-3" : "hidden"}>
        <label className="flex flex-col gap-1 text-sm text-charcoal">Le
          <input type="date" name="date" min={today} defaultValue={today} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-charcoal">Créneau
          <select name="slot" className={field}>
            {slots.map((sl) => (
              <option key={sl.id} value={sl.id}>{sl.start.replace(":", "h")} – {sl.end.replace(":", "h")}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

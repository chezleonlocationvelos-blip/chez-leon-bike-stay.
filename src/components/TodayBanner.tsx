import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { LineIcon, type LineIconName } from "@/components/LineIcon";

type Weather = { code: number; tmax: number; rain: number; hour: number };

/** Météo du jour (Open-Meteo, sans clé), mise en cache 30 min. Renvoie null en cas d'échec. */
async function fetchWeather(lat: number, lng: number): Promise<Weather | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,precipitation_probability_max&timezone=Europe%2FParis&forecast_days=1`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const j = await res.json();
    const code = j?.daily?.weather_code?.[0];
    const tmax = j?.daily?.temperature_2m_max?.[0];
    const rain = j?.daily?.precipitation_probability_max?.[0];
    if (typeof code !== "number" || typeof tmax !== "number") return null;
    const hour = Number(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "numeric", hourCycle: "h23" }).format(new Date()));
    return { code, tmax: Math.round(tmax), rain: typeof rain === "number" ? rain : 0, hour };
  } catch {
    return null;
  }
}

function describe(w: Weather): { icon: LineIconName; label: string; nice: boolean } {
  const c = w.code;
  if (c === 0) return { icon: "sun", label: "grand soleil", nice: true };
  if (c <= 2) return { icon: "sunCloud", label: "plutôt ensoleillé", nice: true };
  if (c === 3) return { icon: "cloud", label: "ciel couvert", nice: w.rain < 40 };
  if (c === 45 || c === 48) return { icon: "fog", label: "brouillard", nice: false };
  if (c >= 51 && c <= 67) return { icon: "rain", label: "pluie", nice: false };
  if (c >= 71 && c <= 77) return { icon: "snow", label: "neige", nice: false };
  if (c >= 80 && c <= 82) return { icon: "showers", label: "averses", nice: false };
  if (c >= 95) return { icon: "storm", label: "orages", nice: false };
  return { icon: "sunCloud", label: "temps variable", nice: w.rain < 40 };
}

/** Nombre de vélos libres d'ici la fin de la journée, par type. */
async function remainingBikes(accommodationId: string): Promise<{ electric: number; classic: number }> {
  const db = createSupabaseServiceClient();
  const now = new Date();
  const end = new Date(now.getTime() + 12 * 3600 * 1000);
  const { data: bikes } = await db
    .from("bikes")
    .select("id, bike_types(code)")
    .eq("accommodation_id", accommodationId)
    .eq("status", "available");
  const list = (bikes ?? []) as unknown as { id: string; bike_types: { code: string } | null }[];
  if (list.length === 0) return { electric: 0, classic: 0 };
  const { data: busy } = await db
    .from("reservation_bike_assignments")
    .select("bike_id")
    .eq("active", true)
    .in("bike_id", list.map((b) => b.id))
    .overlaps("period", `[${now.toISOString()},${end.toISOString()})`);
  const taken = new Set((busy ?? []).map((r: { bike_id: string }) => r.bike_id));
  const out = { electric: 0, classic: 0 };
  for (const b of list) {
    if (taken.has(b.id)) continue;
    if (b.bike_types?.code === "electric") out.electric += 1;
    if (b.bike_types?.code === "classic") out.classic += 1;
  }
  return out;
}

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

export async function TodayBanner({
  accommodationId, latitude, longitude,
}: { accommodationId: string; latitude: number | null; longitude: number | null }) {
  const [weather, left] = await Promise.all([
    latitude != null && longitude != null ? fetchWeather(Number(latitude), Number(longitude)) : Promise.resolve(null),
    remainingBikes(accommodationId).catch(() => null),
  ]);
  if (!weather && !left) return null;

  const total = left ? left.electric + left.classic : 0;
  let stock = "";
  if (left) {
    if (total === 0) stock = "Plus de vélo libre aujourd'hui : pensez à réserver pour demain.";
    else if (left.electric > 0 && left.classic > 0)
      stock = `Il reste ${plural(left.electric, "vélo électrique", "vélos électriques")} et ${plural(left.classic, "vélo musculaire", "vélos musculaires")}.`;
    else if (left.electric > 0) stock = `Il reste ${plural(left.electric, "vélo électrique", "vélos électriques")}.`;
    else stock = `Il reste ${plural(left.classic, "vélo musculaire", "vélos musculaires")}.`;
  }

  let headline = "Aujourd'hui";
  let icon: LineIconName = "bike";
  let detail = "";
  if (weather) {
    const d = describe(weather);
    icon = d.icon;
    const moment = weather.hour >= 18 ? "demain" : weather.hour >= 12 ? "cet après-midi" : "aujourd'hui";
    headline = d.nice ? `Beau temps ${moment}` : `${d.label.charAt(0).toUpperCase()}${d.label.slice(1)} ${moment}`;
    detail = `${weather.tmax}°C max${weather.rain >= 30 ? ` · ${weather.rain} % de risque de pluie` : ""}`;
  }

  return (
    <section aria-label="Météo du jour" className="flex items-center gap-3 sm:gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/snookie/snookie.png" alt="Snookie, la mascotte de Chez Léon, présente la météo" width={341} height={440} className="h-auto w-24 flex-none self-end sm:w-32" />
      <div className="relative flex-1 rounded-xl2 border border-line bg-white p-3 text-forest before:absolute before:-left-2 before:top-1/2 before:h-3 before:w-3 before:-translate-y-1/2 before:rotate-45 before:border-b before:border-l before:border-line before:bg-white">
        <p className="text-xs font-bold uppercase tracking-wide text-sage">La météo de Snookie</p>
        <p className="mb-1 text-[11px] italic text-charcoal/70">la nouvelle Madame Irma</p>
        <p>
          <LineIcon name={icon} className="mr-1.5 inline h-6 w-6 -translate-y-0.5 text-sage" />
          <strong>{headline}</strong>{detail ? ` (${detail})` : ""}{stock ? ` : ${stock.charAt(0).toLowerCase()}${stock.slice(1)}` : ""}
        </p>
      </div>
    </section>
  );
}

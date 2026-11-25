import { LineIcon } from "@/components/LineIcon";
import { itinerariesFor, mapsUrl } from "@/lib/itineraries";

/**
 * Itinéraires suggérés depuis l'hébergement.
 * Avant réservation : consultation seule. Après réservation (`unlocked`) : bouton « Ouvrir dans Google Maps ».
 */
export function Itineraries({
  slug, latitude, longitude, unlocked = false, accommodationName,
}: { slug: string; latitude: number | null; longitude: number | null; unlocked?: boolean; accommodationName?: string }) {
  const list = itinerariesFor(slug);
  const canMap = latitude != null && longitude != null;
  const origin = canMap ? { lat: Number(latitude), lng: Number(longitude) } : null;

  return (
    <section>
      <h2 className="font-display text-4xl font-bold text-forest">Itinéraires à vélo{accommodationName ? ` depuis ${accommodationName}` : ""}</h2>
      <p className="mb-3 text-sm text-charcoal">
        {unlocked
          ? "Touchez un itinéraire pour l'ouvrir dans Google Maps, en mode vélo, depuis votre hébergement."
          : "Idées de sorties à proximité. Après votre réservation, chaque itinéraire s'ouvre en un clic dans Google Maps."}
      </p>
      <ul className="grid gap-4 md:grid-cols-3">
        {list.map((it) => (
          <li key={it.id} className="flex flex-col gap-2 rounded-xl2 border border-line bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-sage">{it.kind}{it.oneWay ? " · aller simple" : " · boucle"}</p>
            <h3 className="text-lg font-bold leading-tight text-forest">{it.title}</h3>
            <p className="flex flex-wrap gap-x-3 text-sm font-medium text-forest">
              <span>{it.km} km</span><span>{it.duration}</span><span>{it.level}</span>
            </p>
            <p className="text-sm text-charcoal">{it.summary}</p>
            <p className="flex gap-1.5 text-sm text-charcoal/80"><LineIcon name="idea" className="mt-0.5 h-4 w-4 text-sage" /><span>{it.tip}</span></p>
            <div className="mt-auto flex flex-col gap-1 pt-2">
              {unlocked && origin && (
                <a
                  href={mapsUrl(it, origin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl2 bg-accent px-4 font-button font-bold text-forest"
                >
                  Ouvrir dans Google Maps
                </a>
              )}
              {it.officialUrl && (
                <a href={it.officialUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-forest underline">
                  Fiche officielle
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-charcoal/70">
        Distances et durées : fiches officielles (France Vélo Tourisme, Touraine Nature). L'itinéraire Google Maps est indicatif ; suivez le balisage sur place.
      </p>
    </section>
  );
}

/**
 * Itinéraires cyclables suggérés autour des hébergements.
 * Distances, durées et niveaux : fiches officielles France Vélo Tourisme / Touraine Nature.
 * Le lien Google Maps est un itinéraire « à vélo » approximatif (départ de l'hébergement) ;
 * le tracé balisé officiel reste celui de la fiche.
 */
export type Itinerary = {
  id: string;
  title: string;
  kind: "Loire à Vélo" | "Boucle balisée";
  km: number;
  duration: string;
  level: "Facile" | "Moyen";
  oneWay?: boolean;
  summary: string;
  tip: string;
  /** Points de passage (noms de lieux) pour Google Maps. */
  waypoints: string[];
  /** Destination ; si absente, retour à l'hébergement (boucle). */
  destination?: string;
  officialUrl?: string;
};

const TOURS_VILLANDRY: Itinerary = {
  id: "tours-villandry",
  title: "Tours → Villandry par les rives du Cher",
  kind: "Loire à Vélo",
  km: 22,
  duration: "1 h 30",
  level: "Facile",
  oneWay: true,
  summary: "Voie cyclable le long du Cher, passage par le port de Savonnières, puis les jardins du château de Villandry.",
  tip: "Halte déjeuner idéale à Savonnières. Compter 1 h de plus pour visiter les jardins.",
  waypoints: ["Savonnières, 37510"],
  destination: "Château de Villandry, 37510 Villandry",
  officialUrl: "https://www.francevelotourisme.com/itineraire/la-loire-a-velo-eurovelo-6/tours-villandry",
};

const VILLANDRY_USSE: Itinerary = {
  id: "villandry-usse",
  title: "Villandry → château d'Ussé",
  kind: "Loire à Vélo",
  km: 20.5,
  duration: "1 h 20",
  level: "Facile",
  oneWay: true,
  summary: "Étape de la Loire à Vélo : jardins de Villandry, panorama sur le bec du Cher, château d'Ussé façon conte de fées.",
  tip: "Le parcours suit la levée de Loire en route partagée : prudence aux abords de Langeais.",
  waypoints: ["Château de Villandry, 37510 Villandry", "Langeais, 37130"],
  destination: "Château d'Ussé, 37420 Rigny-Ussé",
  officialUrl: "https://www.francevelotourisme.com/itineraire/la-loire-a-velo-eurovelo-6/villandry-rigny-usse",
};

const INDRE: Itinerary = {
  id: "reliefs-indre",
  title: "Reliefs de l'Indre (boucle n°15)",
  kind: "Boucle balisée",
  km: 13,
  duration: "1 h 10",
  level: "Facile",
  summary: "Petite boucle balisée par Pont-de-Ruan, Artannes et Monts, en partie sur l'Indre à Vélo.",
  tip: "Idéale pour une demi-journée, avec des enfants ou pour une première sortie.",
  waypoints: ["Pont-de-Ruan, 37260", "Artannes-sur-Indre, 37260", "Monts, 37260"],
  officialUrl: "https://www.francevelotourisme.com/destinations/region-centre-val-de-loire-a-velo/autour-de-tours",
};

const FORET_CHATEAU: Itinerary = {
  id: "foret-chateau",
  title: "Entre forêt et château (boucle n°24)",
  kind: "Boucle balisée",
  km: 27,
  duration: "2 h 30",
  level: "Moyen",
  summary: "Boucle balisée par Gizeux, Continvoir et Courléon : forêt, étangs et château de Gizeux.",
  tip: "Elle passe par Continvoir : vous pouvez la commencer directement depuis l'hébergement.",
  waypoints: ["Gizeux, 37340"],
  officialUrl: "https://www.francevelotourisme.com/sites/default/files/itineraire/boucle/plaquette/boucle-24-entre-foret-et-chateau.pdf",
};

const GRANDS_CRUS: Itinerary = {
  id: "grands-crus",
  title: "Grands crus et belles demeures (boucle n°23)",
  kind: "Boucle balisée",
  km: 35,
  duration: "2 h 40",
  level: "Facile",
  summary: "Vignoble de Bourgueil et de Saint-Nicolas-de-Bourgueil : coteaux de vignes, manoirs et châteaux.",
  tip: "Boucle au départ de Bourgueil (distance officielle, hors trajet depuis l'hébergement). Certaines routes sont fréquentées ; un raccourci évite Saint-Nicolas.",
  waypoints: ["Bourgueil, 37140", "Saint-Nicolas-de-Bourgueil, 37140"],
  officialUrl: "https://www.francevelotourisme.com/boucle/25",
};

const VAL_COTEAU: Itinerary = {
  id: "val-coteau",
  title: "Entre val et coteau (boucle n°31)",
  kind: "Boucle balisée",
  km: 25,
  duration: "2 h 30",
  level: "Moyen",
  summary: "Au départ d'Ingrandes-de-Touraine : rue des Roches à flanc de coteau, hameaux d'ardoise et de tuffeau, bords de Loire.",
  tip: "Distance officielle de la boucle, hors trajet depuis l'hébergement. Pensez au vélo électrique pour les côtes.",
  waypoints: ["Ingrandes-de-Touraine, 37140"],
  officialUrl: "https://www.francevelotourisme.com/node/729",
};

const BY_SLUG: Record<string, Itinerary[]> = {
  "yourte-castanea": [FORET_CHATEAU, GRANDS_CRUS, VAL_COTEAU],
};
const DEFAULT: Itinerary[] = [TOURS_VILLANDRY, VILLANDRY_USSE, INDRE];

export const itinerariesFor = (slug: string): Itinerary[] => BY_SLUG[slug] ?? DEFAULT;

/** Lien Google Maps (itinéraire à vélo) depuis l'hébergement. */
export function mapsUrl(it: Itinerary, origin: { lat: number; lng: number }): string {
  const o = `${origin.lat},${origin.lng}`;
  const p = new URLSearchParams({
    api: "1",
    origin: o,
    destination: it.destination ?? o,
    travelmode: "bicycling",
  });
  if (it.waypoints.length) p.set("waypoints", it.waypoints.join("|"));
  return `https://www.google.com/maps/dir/?${p.toString()}`;
}

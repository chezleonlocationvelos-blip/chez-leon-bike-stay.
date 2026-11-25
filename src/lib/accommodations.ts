/**
 * Deux façons de louer :
 * - "self_service" : hébergement partenaire, vélos en libre-service (boîte à clés / cadenas), commission versée à l'hébergeur ;
 * - "counter" : la boutique Chez Léon (Savonnières), retrait et retour au comptoir, sans commission ni code d'accès.
 */
export type AccommodationMode = "self_service" | "counter";
export const ACCOMMODATION_MODES: AccommodationMode[] = ["self_service", "counter"];

export const isCounter = (a: { mode?: string | null } | null | undefined) => a?.mode === "counter";

/** Adresse publique de la réservation boutique (service historique Chez Léon), distincte de Bike & Stay. */
export const SHOP_HOST = "reserver.chezleonlocation.com";
export const shopUrl = () => process.env.SHOP_URL ?? `https://${SHOP_HOST}`;
export const SHOP_SLUG = "boutique-savonnieres";
/** Site vitrine de la boutique (WordPress). */
export const SHOWCASE_URL = "https://chezleonlocation.com";

/** Fiche Google de la boutique (avis réels uniquement). Note et nombre à mettre à jour de temps en temps. */
export const GOOGLE_PLACE_ID = "ChIJ87_088Ev_UcRBRW6MEkzEI8";
export const GOOGLE_REVIEWS_URL = `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`;
export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;
export const GOOGLE_RATING = { score: "5,0", count: 60 };

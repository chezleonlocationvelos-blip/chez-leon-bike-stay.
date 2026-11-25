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

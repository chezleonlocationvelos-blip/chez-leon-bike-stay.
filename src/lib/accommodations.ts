/**
 * Deux façons de louer :
 * - "self_service" : hébergement partenaire, vélos en libre-service (boîte à clés / cadenas), commission versée à l'hébergeur ;
 * - "counter" : la boutique Chez Léon (Savonnières), retrait et retour au comptoir, sans commission ni code d'accès.
 */
export type AccommodationMode = "self_service" | "counter";
export const ACCOMMODATION_MODES: AccommodationMode[] = ["self_service", "counter"];

export const isCounter = (a: { mode?: string | null } | null | undefined) => a?.mode === "counter";

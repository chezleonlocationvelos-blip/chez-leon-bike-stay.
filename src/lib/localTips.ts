/** Conseil local affiché dans l'e-mail de confirmation (clé = slug de l'hébergement). Faits issus des fiches officielles du tourisme en Touraine. */
const TIPS: Record<string, string> = {
  "yourte-castanea":
    "Depuis Continvoir, la boucle n°24 « Entre forêt et château » (27 km) passe par Gizeux : une belle première sortie, entre bois et prairies. Le mardi, c'est jour de marché à Bourgueil, idéal pour garnir les sacoches.",
};
const DEFAULT_TIP =
  "À Savonnières, faites une pause au petit port, ancien port de la marine de Loire, et déjeunez sur place. Le marché a lieu le samedi et le dimanche matin. Poussez ensuite jusqu'aux jardins du château de Villandry, à quelques coups de pédale.";

export const localTip = (slug: string | null | undefined): string => (slug && TIPS[slug]) || DEFAULT_TIP;

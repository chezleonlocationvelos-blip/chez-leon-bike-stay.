/** Photos Chez Léon (fichiers dans /public/photos et /public/hebergements). */
export const PHOTOS = {
  velosChezLeon: "/photos/velos-chez-leon.jpg",
  veloColza: "/photos/velo-colza.jpg",
  savonnieres: "/photos/savonnieres.jpg",
};

/** Photo de couverture par hébergement (clé = slug). À défaut, la photo des vélos Chez Léon. */
export const ACCOMMODATION_PHOTOS: Record<string, string> = {
  "yourte-castanea": "/hebergements/yourte-castanea.jpg",
};
export const DEFAULT_ACCOMMODATION_PHOTO = PHOTOS.velosChezLeon;

/** Galerie par hébergement (clé = slug) : [src, texte alternatif]. */
export const ACCOMMODATION_GALLERY: Record<string, [string, string][]> = {
  "yourte-castanea": [
    ["/hebergements/yourte-castanea-1.jpg", "La yourte au milieu du pré, entourée d'arbres"],
    ["/hebergements/yourte-castanea-2.jpg", "Coin repas et salon sous la charpente en bois de la yourte"],
    ["/hebergements/yourte-castanea-3.jpg", "Canapé-lit et table de la yourte"],
    ["/hebergements/yourte-castanea-4.jpg", "Intérieur de la yourte avec bar et ouverture sur la prairie"],
  ],
};

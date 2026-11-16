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

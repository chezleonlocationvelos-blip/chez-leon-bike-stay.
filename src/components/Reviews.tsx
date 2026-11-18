const MAPS_URL = "https://www.google.com/maps/search/Chez+L%C3%A9on+location+v%C3%A9los+Savonni%C3%A8res";

const REVIEWS = [
  {
    name: "Claire",
    when: "Visité en juillet",
    text: "Notre expérience à vélo a été unique et mémorable, un grand merci à la tante et à la grand mère d’Antoine, qui ont été adorables ! Parcours sans faute pour cette petite entreprise familiale qui a du talent, le sens de l’accueil et du service ++. Vélos top !",
  },
  {
    name: "Chrystele D.",
    when: "Visité en août",
    text: "Un loueur de vélo extra, difficile de trouver plus à l’écoute. Sur la Loire en vélo, 7 rayons de ma roue ont cassé et il m’a prêté la roue de son propre vélo pour finir le périple de 5 jours encore …. Merci !!! Un service au top et bcp de gentillesse associée",
  },
  {
    name: "Loïc L.",
    when: "Visité en juillet",
    text: "Jeune loueur de vélos indépendant chaudement recommandé ! Nous avons pu louer des vélos pour 11 personnes sans aucun soucis en arrivant à l’improviste, accueil chaleureux et conseils avisés, Antoine et sa Grand-mère ont été super sympas…",
  },
];

/** Avis Google réels de Chez Léon (Savonnières). Note : 5,0 sur 60 avis. */
export function Reviews() {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-4xl font-bold text-forest">Ils ont roulé avec nous</h2>
        <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-forest underline">
          <span aria-hidden="true">★★★★★</span> 5,0 · 60 avis Google
        </a>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {REVIEWS.map((r) => (
          <figure key={r.name} className="flex flex-col gap-2 rounded-xl2 border border-line bg-white p-4">
            <div aria-label="5 étoiles sur 5" className="text-sage">★★★★★</div>
            <blockquote className="text-sm text-charcoal">{r.text}</blockquote>
            <figcaption className="mt-auto text-sm font-bold text-forest">
              {r.name} <span className="font-normal text-charcoal/70">· {r.when} · Avis Google</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

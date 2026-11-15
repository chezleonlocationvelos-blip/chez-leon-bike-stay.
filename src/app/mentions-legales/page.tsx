import { LegalPage, H2 } from "@/components/LegalPage";

export const metadata = { title: "Mentions légales – Chez Léon" };

export default function Mentions() {
  return (
    <LegalPage title="Mentions légales">
      <H2>Éditeur</H2>
      <p>
        Chez Léon, entreprise individuelle exploitée par Antoine Breton.<br />
        SIREN : 939 732 301 – SIRET : 939 732 301 00014.<br />
        Adresse : Chez Léon, 38 rue Principale, 37510 Savonnières.<br />
        Email : reservationschezleon@gmail.com.<br />
        Activité : location d&apos;articles de loisirs et de sport (code APE 77.21Z).<br />
        Directeur de la publication : Antoine Breton.
      </p>
      <p>[À COMPLÉTER : numéro de téléphone et numéro de TVA, ou mention « TVA non applicable, article 293 B du CGI » si vous êtes en franchise en base.]</p>
      <H2>Hébergement</H2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis [À VÉRIFIER].</p>
      <H2>Propriété intellectuelle</H2>
      <p>
        L&apos;ensemble des contenus de ce site (textes, images, logo, marque « Chez Léon », structure) est la propriété de l&apos;éditeur,
        sauf mention contraire. Toute reproduction ou réutilisation sans autorisation écrite préalable est interdite.
      </p>
    </LegalPage>
  );
}

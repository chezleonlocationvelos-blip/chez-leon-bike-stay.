import { LegalPage, H2 } from "@/components/LegalPage";

export const metadata = { title: "Mentions légales – Chez Léon" };

export default function Mentions() {
  return (
    <LegalPage title="Mentions légales">
      <H2>Éditeur</H2>
      <p>[À COMPLÉTER : raison sociale, forme juridique, capital, SIRET, adresse du siège à Savonnières, email, téléphone, numéro de TVA, directeur de la publication].</p>
      <H2>Hébergement</H2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis [À VÉRIFIER].</p>
      <H2>Propriété intellectuelle</H2>
      <p>[À COMPLÉTER].</p>
    </LegalPage>
  );
}

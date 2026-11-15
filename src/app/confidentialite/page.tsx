import { LegalPage, H2 } from "@/components/LegalPage";

export const metadata = { title: "Politique de confidentialité – Chez Léon" };

export default function Confidentialite() {
  return (
    <LegalPage title="Politique de confidentialité">
      <H2>Responsable du traitement</H2>
      <p>
        Chez Léon, entreprise individuelle d&apos;Antoine Breton, 38 rue Principale, 37510 Savonnières. Contact : reservationschezleon@gmail.com.
      </p>
      <H2>Données collectées</H2>
      <p>
        Prénom, nom, email, téléphone, détails de la location (dates, hébergement, vélos), état de la caution et des paiements. Les données de carte
        bancaire sont saisies chez notre prestataire Stripe et ne transitent pas par nos serveurs.
      </p>
      <H2>Finalités et bases légales</H2>
      <p>
        Exécution de la location (réservation, paiement, caution, accès aux vélos, restitution) ; envoi des emails liés à votre réservation ; obligations
        comptables et légales ; gestion d&apos;éventuels litiges. Nous n&apos;utilisons pas vos données à des fins publicitaires et ne les vendons pas.
      </p>
      <H2>Destinataires et sous-traitants</H2>
      <p>
        L&apos;hébergeur partenaire où se trouvent les vélos (informations limitées à la réservation, sans vos coordonnées), Stripe (paiement), Supabase (base
        de données), Vercel (hébergement du site), Resend (envoi d&apos;emails). Certains de ces prestataires peuvent traiter des données hors de l&apos;Union
        européenne, notamment aux États-Unis, dans le cadre de garanties prévues par le RGPD (clauses contractuelles types ou cadre de protection des
        données UE–États-Unis).
      </p>
      <H2>Durée de conservation</H2>
      <p>
        Les données de réservation sont conservées 3 ans après la fin de la location, pour gérer d&apos;éventuels litiges. Les pièces comptables (paiements,
        factures) sont conservées 10 ans, conformément à la loi. Passé ces délais, les données sont supprimées ou anonymisées.
      </p>
      <H2>Vos droits</H2>
      <p>
        Accès, rectification, effacement, opposition, limitation et portabilité : écrivez à reservationschezleon@gmail.com ; nous répondons sous un mois.
        Vous pouvez aussi saisir la CNIL (cnil.fr).
      </p>
    </LegalPage>
  );
}

import { LegalPage, H2 } from "@/components/LegalPage";

export const metadata = { title: "Politique de confidentialité – Chez Léon" };

export default function Confidentialite() {
  return (
    <LegalPage title="Politique de confidentialité">
      <H2>Responsable du traitement</H2>
      <p>[À COMPLÉTER : raison sociale, adresse, email de contact de Chez Léon].</p>
      <H2>Données collectées</H2>
      <p>Prénom, nom, email, téléphone, détails de la location (dates, hébergement, vélos), état de la caution et des paiements. Les données de carte bancaire sont saisies chez notre prestataire Stripe et ne transitent pas par nos serveurs.</p>
      <H2>Finalités et bases légales</H2>
      <p>Exécution de la location (réservation, paiement, caution, accès aux vélos, restitution) ; envoi des emails liés à votre réservation ; obligations comptables et légales ; gestion d'éventuels litiges.</p>
      <H2>Destinataires et sous-traitants</H2>
      <p>L'hébergeur partenaire où se trouvent les vélos (informations limitées à la réservation, sans vos coordonnées), Stripe (paiement), Supabase (base de données), Vercel (hébergement), Resend (envoi d'emails). [À COMPLÉTER : localisation des données et garanties pour les transferts hors Union européenne.]</p>
      <H2>Durée de conservation</H2>
      <p>[À COMPLÉTER : durées, par exemple données de réservation et de facturation conservées X ans.]</p>
      <H2>Vos droits</H2>
      <p>Accès, rectification, effacement, opposition, limitation et portabilité : écrivez à [À COMPLÉTER : email]. Vous pouvez saisir la CNIL (cnil.fr).</p>
    </LegalPage>
  );
}

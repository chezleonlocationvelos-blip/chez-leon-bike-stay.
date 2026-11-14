import { LegalPage, H2 } from "@/components/LegalPage";

export const metadata = { title: "Conditions de location – Chez Léon" };

export default function Conditions() {
  return (
    <LegalPage title="Conditions de location">
      <H2>1. Objet</H2>
      <p>Les présentes conditions encadrent la location de vélos par [À COMPLÉTER : raison sociale et forme juridique de Chez Léon], disponibles dans les hébergements partenaires.</p>
      <H2>2. Réservation et paiement</H2>
      <p>La réservation est confirmée après paiement en ligne du prix de la location, par carte bancaire, via notre prestataire de paiement Stripe. Les prix affichés sont en euros, toutes taxes comprises [À VÉRIFIER : régime de TVA]. Casque et antivol sont inclus ; les sacoches sont facturées en supplément.</p>
      <H2>3. Caution</H2>
      <p>Une caution est demandée par vélo, au montant affiché lors de la réservation. Il s'agit d'une empreinte bancaire (autorisation) et non d'un débit. Elle est à autoriser dans les 24 heures précédant le retrait ; le code d'accès aux vélos n'est communiqué qu'une fois la caution autorisée. Elle est libérée à la restitution du matériel en bon état.</p>
      <H2>4. Retrait, durée et retour</H2>
      <p>Une journée de location court de 9 h 00 à 18 h 30 ; une demi-journée correspond à un créneau de 4 heures. Les vélos doivent être restitués dans l'hébergement avant la fin de la période réservée, cadenassés, avec leurs accessoires. [À COMPLÉTER : conséquences d'un retour tardif et tarif de la journée supplémentaire.]</p>
      <H2>5. Responsabilité du locataire, dommages, vol</H2>
      <p>Le locataire utilise le matériel avec soin et en respectant le code de la route. En cas de dommage, de perte ou de vol pendant la location, Chez Léon peut retenir sur la caution une somme correspondant au préjudice, dans la limite du montant de la caution, selon le barème suivant : [À COMPLÉTER : barème des réparations et du remplacement]. Un constat est établi lors de la restitution.</p>
      <H2>6. Annulation et droit de rétractation</H2>
      <p>[À COMPLÉTER : politique d'annulation et de modification, remboursement en cas d'intempéries.] [À FAIRE VALIDER : information sur l'absence de droit de rétractation pour une prestation de loisirs à date déterminée.]</p>
      <H2>7. Assurance</H2>
      <p>[À COMPLÉTER : assurance responsabilité civile de Chez Léon, assurance éventuelle couvrant les vélos, responsabilité du locataire.]</p>
      <H2>8. Données personnelles</H2>
      <p>Voir notre <a className="underline" href="/confidentialite">politique de confidentialité</a>.</p>
      <H2>9. Droit applicable et litiges</H2>
      <p>Droit français. [À COMPLÉTER : coordonnées du médiateur de la consommation.]</p>
    </LegalPage>
  );
}

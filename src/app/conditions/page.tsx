import { LegalPage, H2 } from "@/components/LegalPage";

export const metadata = { title: "Conditions de location – Chez Léon" };

export default function Conditions() {
  return (
    <LegalPage title="Conditions de location">
      <H2>1. Objet</H2>
      <p>
        Les présentes conditions encadrent la location de vélos par Chez Léon (entreprise individuelle d&apos;Antoine Breton, SIRET 939 732 301 00014,
        38 rue Principale, 37510 Savonnières), vélos mis à disposition dans les hébergements partenaires. Toute réservation vaut acceptation pleine
        et entière des présentes conditions, que le locataire reconnaît avoir lues avant de payer.
      </p>

      <H2>2. Réservation et paiement</H2>
      <p>
        La réservation est confirmée après paiement en ligne du prix de la location, par carte bancaire, via notre prestataire de paiement Stripe.
        Les prix sont en euros, TVA non applicable (article 293 B du CGI). Casque et antivol sont inclus ; les sacoches sont facturées en supplément.
        Le locataire garantit l&apos;exactitude des informations fournies à la réservation.
      </p>

      <H2>3. Conditions pour louer</H2>
      <p>
        Le locataire doit avoir 18 ans révolus, être apte à la pratique du vélo et n&apos;avoir aucune contre-indication médicale. Il utilise lui-même le
        matériel : le prêt, la sous-location et la cession à un tiers sont interdits. Un mineur ne peut utiliser un vélo que sous la responsabilité d&apos;un
        adulte qui a réservé et qui répond de lui. Le locataire déclare être couvert par une assurance de responsabilité civile (par exemple celle de son
        contrat d&apos;assurance habitation) pour les dommages qu&apos;il pourrait causer à autrui.
      </p>

      <H2>4. Caution</H2>
      <p>
        Une caution est demandée par vélo, au montant affiché lors de la réservation. Il s&apos;agit d&apos;une empreinte bancaire (autorisation) et non d&apos;un
        débit. Elle est à autoriser dans les 24 heures précédant le retrait ; le code d&apos;accès aux vélos n&apos;est communiqué qu&apos;une fois la caution
        autorisée. Le locataire autorise Chez Léon à prélever sur la caution les sommes dues au titre de la location (dommages, perte, vol, retard,
        accessoires manquants). Elle est libérée à la restitution du matériel en bon état. Les délais de libération des fonds dépendent de la banque du
        locataire.
      </p>

      <H2>5. Retrait, durée et retour</H2>
      <p>
        Une journée de location court de 9 h 00 à 18 h 30 ; une demi-journée correspond à un créneau de 4 heures. Les vélos doivent être restitués dans
        l&apos;hébergement avant la fin de la période réservée, cadenassés, avec leurs accessoires. En cas de retour tardif, chaque journée entamée au-delà de
        la période réservée est facturée au tarif de la location en vigueur, prélevée sur la caution. Un vélo non restitué plus de 24 heures après la fin
        de la période réservée, sans accord de Chez Léon, est considéré comme perdu ou volé (article 6).
      </p>

      <H2>6. Responsabilité du locataire, dommages, perte et vol</H2>
      <p>
        Le locataire reçoit le matériel en bon état de fonctionnement et le restitue dans le même état, hors usure normale. Il l&apos;utilise avec soin,
        respecte le code de la route et reste seul responsable de son comportement, de ses effets personnels et des dommages causés à lui-même ou à autrui.
        Il s&apos;engage à attacher le vélo à un point fixe avec l&apos;antivol fourni dès qu&apos;il le laisse sans surveillance, y compris pendant une courte pause.
        Il signale sans délai toute panne ou tout incident.
      </p>
      <p>
        En cas de dommage, de perte ou de vol, Chez Léon retient sur la caution le coût de la remise en état sur facture, ou à défaut selon le barème
        forfaitaire suivant : chambre à air ou crevaison 15 € ; pneu 40 € ; antivol, casque ou accessoire perdu ou cassé 40 € ; sacoche perdue ou cassée
        selon sa valeur d&apos;achat ; vélo volé, perdu ou irréparable : valeur de remplacement du vélo. Si le préjudice dépasse la caution, Chez Léon peut
        réclamer le complément sur justificatifs. En cas de vol, le locataire prévient Chez Léon dans les 24 heures et dépose plainte sous 72 heures ; le
        vol d&apos;un vélo qui n&apos;était pas attaché à un point fixe avec l&apos;antivol fourni reste à la charge du locataire. Un constat de l&apos;état du matériel
        est établi à la restitution.
      </p>

      <H2>7. Annulation, modification et météo</H2>
      <p>
        Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation de 14 jours ne s&apos;applique pas aux prestations de loisirs
        fournies à une date déterminée. Chez Léon accorde cependant les facilités suivantes : annulation gratuite et remboursement intégral jusqu&apos;à 7 jours
        avant le début de la location ; entre 7 jours et 48 heures avant, remboursement de 50 % ; moins de 48 heures avant ou en cas de non-présentation,
        aucun remboursement. Une modification de dates est possible sans frais jusqu&apos;à 48 heures avant, dans la limite des disponibilités.
      </p>
      <p>
        La pluie ne donne pas droit à remboursement. En cas d&apos;alerte météo orange ou rouge de Météo-France sur le Cher ou l&apos;Indre-et-Loire le jour de la
        location, le locataire peut obtenir le report de sa réservation ou un remboursement, sur demande avant le retrait. Si Chez Léon doit annuler pour une
        raison qui lui est propre (vélo indisponible, panne, sécurité), le locataire est intégralement remboursé.
      </p>

      <H2>8. Assurance</H2>
      <p>
        Chez Léon [À COMPLÉTER : indiquer l&apos;assurance de responsabilité civile professionnelle souscrite et son assureur]. Le prix de la location
        n&apos;inclut pas d&apos;assurance contre le vol ou la casse du vélo : la caution et le barème de l&apos;article 6 s&apos;appliquent. Le locataire reste libre de
        souscrire une assurance complémentaire.
      </p>

      <H2>9. Données personnelles</H2>
      <p>Voir notre <a className="underline" href="/confidentialite">politique de confidentialité</a>.</p>

      <H2>10. Droit applicable et litiges</H2>
      <p>
        Droit français. En cas de litige, le locataire contacte d&apos;abord Chez Léon par écrit à reservationschezleon@gmail.com. À défaut de solution amiable,
        le locataire consommateur peut recourir gratuitement au médiateur de la consommation : [À COMPLÉTER : nom et coordonnées du médiateur].
      </p>
    </LegalPage>
  );
}

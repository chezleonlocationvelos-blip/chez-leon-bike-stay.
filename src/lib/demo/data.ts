/** Données FICTIVES pour la démonstration (/demo). Aucune connexion à la base : rien n'est lu ni enregistré. */
export const DEMO_ACCOMMODATIONS = [
  { id: "a1", name: "Camping des Rives (exemple)", type: "camping", city: "Savonnières", commissionPct: 20, bikes: { electric: 4, classic: 4 }, stripe: "Paiements activés" },
  { id: "a2", name: "Gîte du Moulin (exemple)", type: "gîte", city: "Villandry", commissionPct: 15, bikes: { electric: 2, classic: 2 }, stripe: "Paiements activés" },
  { id: "a3", name: "Yourte des Bois (exemple)", type: "yourte", city: "Continvoir", commissionPct: 20, bikes: { electric: 2, classic: 2 }, stripe: "Inscription à finaliser" },
];

export const DEMO_BIKES = [
  { code: "ELEC-001", type: "Vélo électrique", acc: "Camping des Rives (exemple)", status: "Disponible" },
  { code: "ELEC-002", type: "Vélo électrique", acc: "Camping des Rives (exemple)", status: "En location" },
  { code: "ELEC-003", type: "Vélo électrique", acc: "Camping des Rives (exemple)", status: "En attente de contrôle" },
  { code: "ELEC-004", type: "Vélo électrique", acc: "Gîte du Moulin (exemple)", status: "Disponible" },
  { code: "ELEC-005", type: "Vélo électrique", acc: "Yourte des Bois (exemple)", status: "Disponible" },
  { code: "CLASS-001", type: "Vélo classique", acc: "Camping des Rives (exemple)", status: "Disponible" },
  { code: "CLASS-002", type: "Vélo classique", acc: "Camping des Rives (exemple)", status: "Réservé" },
  { code: "CLASS-003", type: "Vélo classique", acc: "Gîte du Moulin (exemple)", status: "Disponible" },
  { code: "CLASS-004", type: "Vélo classique", acc: "Yourte des Bois (exemple)", status: "En maintenance" },
  { code: "CLASS-005", type: "Vélo classique", acc: "Yourte des Bois (exemple)", status: "Disponible" },
];

export const DEMO_RESERVATIONS = [
  { number: "CL-DEMO-0008", customer: "Camille Durand", acc: "Camping des Rives (exemple)", start: "samedi 12 juin 2027 à 09:00", status: "Retour déclaré", total: 5500 },
  { number: "CL-DEMO-0007", customer: "Lucas Moreau", acc: "Camping des Rives (exemple)", start: "samedi 12 juin 2027 à 09:00", status: "En cours", total: 3600 },
  { number: "CL-DEMO-0006", customer: "Inès Lambert", acc: "Gîte du Moulin (exemple)", start: "dimanche 13 juin 2027 à 09:00", status: "Prête", total: 7200 },
  { number: "CL-DEMO-0005", customer: "Hugo Petit", acc: "Yourte des Bois (exemple)", start: "lundi 14 juin 2027 à 09:00", status: "En attente de caution", total: 1900 },
  { number: "CL-DEMO-0004", customer: "Jade Roux", acc: "Camping des Rives (exemple)", start: "mardi 15 juin 2027 à 09:00", status: "Confirmée", total: 6500 },
  { number: "CL-DEMO-0003", customer: "Nathan Faure", acc: "Gîte du Moulin (exemple)", start: "mercredi 16 juin 2027 à 09:00", status: "Confirmée", total: 3200 },
  { number: "CL-DEMO-0002", customer: "Léa Girard", acc: "Camping des Rives (exemple)", start: "jeudi 3 juin 2027 à 09:00", status: "Terminée", total: 5500 },
  { number: "CL-DEMO-0001", customer: "Tom Bernard", acc: "Yourte des Bois (exemple)", start: "mercredi 2 juin 2027 à 09:00", status: "Terminée", total: 2600 },
];

export const DEMO_PRICING = [
  { type: "Vélo électrique", half: 2600, day: 3600, two: 6500, three: 2800, deposit: 100000 },
  { type: "Vélo classique", half: 1600, day: 1900, two: 3200, three: 1500, deposit: 30000 },
];

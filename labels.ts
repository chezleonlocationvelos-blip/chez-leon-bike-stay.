export const reservationStatusLabels: Record<string, string> = {
  draft: "Brouillon", pending_payment: "En attente de paiement", pending_deposit: "En attente de caution",
  confirmed: "Confirmée", access_preparing: "Accès en préparation", ready: "Prête", in_progress: "En cours",
  return_declared: "Retour déclaré", completed: "Terminée", cancelled: "Annulée / expirée", incident: "Incident",
};
export const bikeStatusLabels: Record<string, string> = {
  available: "Disponible", reserved: "Réservé", rented: "En location", pending_check: "En attente de contrôle",
  maintenance: "En maintenance", unavailable: "Indisponible", stolen: "Volé", retired: "Retiré de la flotte",
};

/** Interface indépendante du fabricant (cahier des charges, partie 13). */
export type AccessGrantStatus = "pending" | "generated" | "active" | "expired" | "revoked" | "failed";

export interface AccessGrant {
  status: AccessGrantStatus;
  /** Jamais loggé, jamais placé dans une URL. Absent tant que l'accès n'est pas réellement prêt. */
  code?: string;
  validFrom: Date;
  validUntil: Date;
  simulated: boolean;
}

export interface LockProvider {
  readonly name: string;
  /** Définit (ou fait définir) le code pour une location. Ne renvoie jamais de faux code en cas d'échec. */
  createGrant(input: { lockId: string; reservationId: string; validFrom: Date; validUntil: Date }): Promise<AccessGrant>;
  revokeGrant(input: { lockId: string; reservationId: string }): Promise<void>;
}

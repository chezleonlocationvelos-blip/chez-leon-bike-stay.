/** Décision pure sur le sort de la caution (testable sans Stripe). */
export type DepositOutcome =
  | { action: "release" }                       // aucun dommage : empreinte libérée
  | { action: "capture"; amountCents: number }; // dommage : capture de la part correspondante ; le reste est libéré automatiquement par Stripe

export function depositOutcome(damageCents: number, depositCents: number): DepositOutcome {
  if (!Number.isInteger(damageCents) || damageCents < 0) throw new Error("INVALID_AMOUNT");
  if (damageCents > depositCents) throw new Error("INVALID_AMOUNT");
  return damageCents === 0 ? { action: "release" } : { action: "capture", amountCents: damageCents };
}

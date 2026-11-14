import type { AccessGrant, LockProvider } from "./types";

/** Démonstration uniquement : le code renvoyé n'ouvre aucun cadenas réel. */
export class MockLockProvider implements LockProvider {
  readonly name = "mock";

  async createGrant(input: { validFrom: Date; validUntil: Date }): Promise<AccessGrant> {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    return { status: "generated", code, validFrom: input.validFrom, validUntil: input.validUntil, simulated: true };
  }

  async revokeGrant(): Promise<void> {}
}

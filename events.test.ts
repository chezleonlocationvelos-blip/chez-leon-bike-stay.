import { describe, expect, it } from "vitest";
import Stripe from "stripe";
import { extractAction } from "./events";

const ev = (type: string, object: unknown) => ({ id: "evt_1", type, data: { object } }) as unknown as Stripe.Event;

describe("extractAction", () => {
  it("location payée → action rental avec montant et client", () => {
    const a = extractAction(ev("checkout.session.completed", {
      metadata: { kind: "rental", reservation_id: "res-1" }, payment_status: "paid",
      payment_intent: "pi_1", amount_total: 8400, customer: "cus_9",
    }));
    expect(a).toEqual({ kind: "rental", reservationId: "res-1", paymentIntentId: "pi_1", amountCents: 8400, customerId: "cus_9" });
  });
  it("session non payée : ignorée", () => {
    expect(extractAction(ev("checkout.session.completed", {
      metadata: { kind: "rental", reservation_id: "r" }, payment_status: "unpaid", payment_intent: "pi", amount_total: 1,
    }))).toBeNull();
  });
  it("session de caution (checkout.session.completed) : ignorée, c'est le PaymentIntent qui fait foi", () => {
    expect(extractAction(ev("checkout.session.completed", {
      metadata: { kind: "deposit", reservation_id: "r" }, payment_status: "unpaid", payment_intent: "pi", amount_total: 100000,
    }))).toBeNull();
  });
  it("caution autorisée → action deposit avec le montant réellement autorisé", () => {
    const a = extractAction(ev("payment_intent.amount_capturable_updated", {
      id: "pi_d", status: "requires_capture", amount_capturable: 100000, metadata: { kind: "deposit", reservation_id: "res-2" },
    }));
    expect(a).toEqual({ kind: "deposit", reservationId: "res-2", paymentIntentId: "pi_d", amountCents: 100000, customerId: null });
  });
  it("PaymentIntent de location ou statut inattendu : ignoré", () => {
    expect(extractAction(ev("payment_intent.amount_capturable_updated", { id: "p", status: "requires_capture", amount_capturable: 1, metadata: { kind: "rental", reservation_id: "r" } }))).toBeNull();
    expect(extractAction(ev("payment_intent.amount_capturable_updated", { id: "p", status: "canceled", amount_capturable: 0, metadata: { kind: "deposit", reservation_id: "r" } }))).toBeNull();
  });
  it("metadata absente : ignoré", () => {
    expect(extractAction(ev("checkout.session.completed", { payment_status: "paid", payment_intent: "pi", amount_total: 1 }))).toBeNull();
  });
  it("account.updated → état du compte hébergeur", () => {
    expect(extractAction(ev("account.updated", { id: "acct_1", payouts_enabled: true, details_submitted: true })))
      .toEqual({ kind: "account", accountId: "acct_1", payoutsEnabled: true, detailsSubmitted: true });
  });
  it("événement inconnu : ignoré", () => expect(extractAction(ev("customer.created", {}))).toBeNull());
});

describe("signature du webhook", () => {
  const stripe = new Stripe("sk_test_dummy");
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_sig", object: "event", type: "customer.created", data: { object: {} } });

  it("accepte une signature valide", () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    expect(stripe.webhooks.constructEvent(payload, header, secret).id).toBe("evt_sig");
  });
  it("rejette un corps modifié", () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    expect(() => stripe.webhooks.constructEvent(payload + " ", header, secret)).toThrow();
  });
  it("rejette un mauvais secret", () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_autre" });
    expect(() => stripe.webhooks.constructEvent(payload, header, secret)).toThrow();
  });
});

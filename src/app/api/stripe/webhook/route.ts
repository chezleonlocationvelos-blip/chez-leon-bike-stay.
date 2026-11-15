import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { handleStripeEvent } from "@/lib/stripe/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Deux points de terminaison Stripe peuvent coexister : celui de la plateforme et celui des comptes connectés (Connect),
  // chacun avec son propre secret de signature.
  const secrets = [process.env.STRIPE_WEBHOOK_SECRET, process.env.STRIPE_CONNECT_WEBHOOK_SECRET].filter((s): s is string => !!s);
  const signature = request.headers.get("stripe-signature");
  if (secrets.length === 0 || !signature) return new NextResponse("Bad request", { status: 400 });

  const body = await request.text(); // corps brut indispensable à la vérification de signature
  let event;
  for (const secret of secrets) {
    try {
      event = getStripe().webhooks.constructEvent(body, signature, secret);
      break;
    } catch { /* on essaie le secret suivant */ }
  }
  if (!event) return new NextResponse("Invalid signature", { status: 400 });

  try {
    const result = await handleStripeEvent(event);
    return NextResponse.json({ received: true, result });
  } catch (e) {
    console.error("stripe webhook error", event.id, e instanceof Error ? e.message : e);
    return new NextResponse("Webhook handler failed", { status: 500 }); // Stripe réessaiera
  }
}

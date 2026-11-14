import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { handleStripeEvent } from "@/lib/stripe/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new NextResponse("Bad request", { status: 400 });

  const body = await request.text(); // corps brut indispensable à la vérification de signature
  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    const result = await handleStripeEvent(event);
    return NextResponse.json({ received: true, result });
  } catch (e) {
    console.error("stripe webhook error", event.id, e instanceof Error ? e.message : e);
    return new NextResponse("Webhook handler failed", { status: 500 }); // Stripe réessaiera
  }
}

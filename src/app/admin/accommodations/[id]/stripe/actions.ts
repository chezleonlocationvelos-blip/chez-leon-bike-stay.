"use server";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/roles";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { appUrl, getStripe } from "@/lib/stripe/client";

/** Crée (si besoin) le compte Stripe Express de l'hébergeur et ouvre son inscription hébergée par Stripe. */
export async function startStripeOnboarding(accommodationId: string) {
  const { userId } = await requireRole("admin");
  const db = createSupabaseServiceClient();
  const stripe = getStripe();
  const back = `/admin/accommodations/${accommodationId}`;

  const { data: acc } = await db.from("accommodations").select("id, name, email, stripe_account_id").eq("id", accommodationId).maybeSingle();
  if (!acc) redirect("/admin/accommodations");

  let accountId = acc.stripe_account_id as string | null;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: acc.email ?? undefined,
      capabilities: { transfers: { requested: true } },
      metadata: { accommodation_id: acc.id },
    }, { idempotencyKey: `acct-${acc.id}` });
    accountId = account.id;
    await db.from("accommodations").update({ stripe_account_id: accountId }).eq("id", acc.id);
    await db.from("audit_logs").insert({ actor_id: userId, action: "stripe.account_created", entity: "accommodation", entity_id: acc.id, details: { account: accountId } });
  }

  const link = await stripe.accountLinks.create({
    account: accountId, type: "account_onboarding",
    refresh_url: `${appUrl()}${back}`, return_url: `${appUrl()}${back}?stripe=returned`,
  });
  redirect(link.url);
}

import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AccommodationForm } from "@/components/admin/AccommodationForm";
import { startStripeOnboarding } from "./stripe/actions";
import { Button } from "@/components/ui/Button";
import { isStripeConfigured } from "@/lib/stripe/client";

export default async function EditAccommodation({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("accommodations").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-forest">{data.name}</h1>
      <div className="flex flex-wrap items-center gap-3 rounded-xl2 bg-white p-4">
        <span>QR code :</span>
        <a className="underline" href={`/admin/accommodations/${id}/qr?format=png`}>PNG</a>
        <a className="underline" href={`/admin/accommodations/${id}/qr?format=svg`}>SVG</a>
        <a className="underline" href={`/admin/accommodations/${id}/qr?format=svg`} target="_blank" rel="noreferrer">Aperçu imprimable</a>
      </div>
      <div className="flex flex-col gap-2 rounded-xl2 bg-white p-4">
        <h2 className="font-semibold">Versement de la commission (Stripe Connect)</h2>
        <p className="text-sm">
          {data.stripe_payouts_enabled ? "Compte Stripe actif : les commissions peuvent être versées."
            : data.stripe_account_id ? "Inscription Stripe commencée mais incomplète : l'hébergeur doit la terminer."
            : "Aucun compte Stripe : la commission ne peut pas être versée automatiquement."}
        </p>
        {isStripeConfigured() ? (
          <form action={startStripeOnboarding.bind(null, id)}>
            <Button type="submit" variant="secondary">{data.stripe_account_id ? "Reprendre l'inscription Stripe" : "Lancer l'inscription Stripe"}</Button>
          </form>
        ) : <p className="text-sm">Stripe n'est pas configuré (STRIPE_SECRET_KEY absente).</p>}
      </div>
      <AccommodationForm values={data} error={error} />
    </section>
  );
}

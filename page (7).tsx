import { AccommodationForm } from "@/components/admin/AccommodationForm";

export default async function NewAccommodation({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold text-forest">Nouvel hébergement</h1>
      <AccommodationForm error={error} />
    </section>
  );
}

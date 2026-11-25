import Link from "next/link";

/** Onglets de la rubrique « Vélos et accessoires » de l'administration. */
export function BikesTabs({ current }: { current: "bikes" | "accessories" }) {
  const tab = (active: boolean) =>
    `rounded-xl2 px-4 py-2 font-medium ${active ? "bg-forest text-white" : "border border-line bg-white text-forest hover:bg-sage/20"}`;
  return (
    <div className="mb-4 flex gap-2">
      <Link href="/admin/bikes" className={tab(current === "bikes")}>Vélos</Link>
      <Link href="/admin/bikes/accessoires" className={tab(current === "accessories")}>Accessoires</Link>
    </div>
  );
}

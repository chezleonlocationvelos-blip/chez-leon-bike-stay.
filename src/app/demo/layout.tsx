import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Démonstration – Chez Léon Bike & Stay", robots: { index: false, follow: false } };

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div role="status" className="bg-accent px-4 py-2 text-center text-sm font-medium text-forest">
        Mode démonstration : données fictives, rien n'est enregistré.
      </div>
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <SiteHeader />
        <Link href="/demo" className="px-6 pt-3 text-sm underline">Changer d'espace</Link>
      </div>
      <div className="mx-auto max-w-5xl p-6">{children}</div>
    </>
  );
}

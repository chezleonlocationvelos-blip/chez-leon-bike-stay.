import type { Metadata } from "next";
import "./globals.css";
import { DemoBanner } from "@/components/DemoBanner";

export const metadata: Metadata = { title: "Chez Léon Bike & Stay" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}

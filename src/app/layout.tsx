import type { Metadata } from "next";
import { Amatic_SC, Lato, Roboto } from "next/font/google";
import "./globals.css";
import { DemoBanner } from "@/components/DemoBanner";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto", display: "swap" });
const amatic = Amatic_SC({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-amatic", display: "swap" });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lato", display: "swap" });

export const metadata: Metadata = { title: "Chez Léon Bike & Stay" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${roboto.variable} ${amatic.variable} ${lato.variable}`}>
      <body className="font-sans">
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}

"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

const STAY_LINKS = [
  { href: "/#hebergements", label: "Où louer" },
  { href: "/#comment", label: "Comment ça marche" },
  { href: "/#avis", label: "Avis" },
  { href: "/#hebergeurs", label: "Hébergeurs" },
];

/** Menu de la boutique : celui du site vitrine chezleonlocation.com (service historique). */
const SHOWCASE = "https://chezleonlocation.com";
const SHOP_LINKS = [
  { href: `${SHOWCASE}/`, label: "Accueil" },
  { href: `${SHOWCASE}/presentation-des-velos/`, label: "Nos vélos" },
  { href: `${SHOWCASE}/packages-aventures/`, label: "Séjours" },
  { href: `${SHOWCASE}/contact/`, label: "Contact" },
];
const SHOP_BOOKING = "https://reserver.chezleonlocation.com/";

/**
 * En-tête fixe : menu en ligne sur ordinateur, menu déroulant sur téléphone.
 * variant "shop" = boutique Chez Léon (liens vers le site vitrine), sinon Bike & Stay.
 */
export function SiteHeader({ variant = "stay" }: { variant?: "stay" | "shop" }) {
  const [open, setOpen] = useState(false);
  const shop = variant === "shop";
  const LINKS = shop ? SHOP_LINKS : STAY_LINKS;
  const home = shop ? `${SHOWCASE}/` : "/";
  const booking = shop ? SHOP_BOOKING : "/#hebergements";
  const link = "rounded-xl2 px-3 py-2 font-button text-forest hover:bg-sage/20";

  return (
    <header className="sticky top-0 z-[1100] border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-2">
        <a href={home} aria-label="Chez Léon, retour à l'accueil" className="flex items-center gap-3">
          <img src="/logo.png" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
          <span className="hidden font-display text-3xl font-bold leading-none text-forest sm:inline">Chez Léon</span>
        </a>

        <nav aria-label="Menu principal" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => <a key={l.href} href={l.href} className={link}>{l.label}</a>)}
          <a href={booking} className="ml-2 inline-flex min-h-11 items-center rounded-xl2 border border-forest/30 bg-accent px-5 font-button font-bold text-forest hover:bg-[#dfc89f]">
            Réserver
          </a>
        </nav>

        <button
          type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="flex h-11 w-11 items-center justify-center rounded-xl2 border border-line text-forest md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Menu principal" className="border-t border-line bg-white px-6 pb-4 pt-2 md:hidden">
          <ul className="flex flex-col">
            {LINKS.map((l) => (
              <li key={l.href}><a href={l.href} onClick={() => setOpen(false)} className="block py-3 font-button text-lg text-forest">{l.label}</a></li>
            ))}
            <li className="pt-2">
              <a href={booking} onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-center rounded-xl2 border border-forest/30 bg-accent font-button font-bold text-forest">
                Réserver un vélo
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

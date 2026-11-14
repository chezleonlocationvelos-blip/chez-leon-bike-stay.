import Link from "next/link";
import { getMessages } from "@/i18n";

export default function Home() {
  const t = getMessages();
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold text-forest">{t.app.name}</h1>
      <p>Les clients accèdent à la réservation en scannant le QR code de leur hébergement (/h/&lt;slug&gt;, phase 3).</p>
      <nav className="flex gap-3">
        <Link className="rounded-xl2 bg-forest px-5 py-3 text-white" href="/admin">{t.nav.admin}</Link>
        <Link className="rounded-xl2 border border-forest px-5 py-3 text-forest" href="/partner">{t.nav.partner}</Link>
      </nav>
      <p className="flex gap-4 text-sm">
        <a className="underline" href="/conditions">Conditions de location</a>
        <a className="underline" href="/confidentialite">Confidentialité</a>
        <a className="underline" href="/mentions-legales">Mentions légales</a>
      </p>
    </main>
  );
}

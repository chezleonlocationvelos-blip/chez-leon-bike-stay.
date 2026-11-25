/** Gabarits d'emails (purs, testables). Tout texte variable est échappé. */
import { euros } from "@/lib/format";

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

type Base = { firstName: string; number: string; accommodation: string; startLabel: string; endLabel: string; link: string;
  /** Boutique Chez Léon : retrait au comptoir (adresse et horaires), pas de code d'accès. */
  counter?: { address?: string | null; hours?: string | null } };

const pickupHtml = (c: NonNullable<Base["counter"]>) =>
  `<p style="background:#F4EBDB;border-radius:3px;padding:12px 16px;margin:16px 0"><strong>Retrait et retour à la boutique</strong>${c.address ? `<br>${esc(c.address)}` : ""}${c.hours ? `<br>Horaires : ${esc(c.hours)}` : ""}<br>Présentez simplement votre numéro de réservation.</p>`;
const pickupText = (c: NonNullable<Base["counter"]>) =>
  `Retrait et retour à la boutique${c.address ? ` : ${c.address}` : ""}${c.hours ? ` (horaires : ${c.hours})` : ""}. Présentez votre numéro de réservation.`;
export type ConfirmationData = Base & { tip?: string; lines: { label: string; qty: number; totalCents: number }[]; totalCents: number; depositCents: number };

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://bike.chezleonlocation.com";

/** Charte Chez Léon (site chezleonlocation.com) : fond clair, bandeau vert sauge, beige, vert foncé. */
const wrap = (title: string, body: string) =>
  `<!doctype html><html lang="fr"><body style="margin:0;background:#F9F9F9;font-family:Roboto,Arial,sans-serif;color:#2F3D19">
<div style="max-width:560px;margin:0 auto;padding:16px">
<div style="background:#809758;border-radius:3px 3px 0 0;padding:16px 24px;text-align:left">
<img src="${BASE_URL}/logo.png" alt="Chez Léon" width="64" height="64" style="display:block;border:0;width:64px;height:64px">
</div>
<div style="background:#ffffff;border:1px solid #D5DCC8;border-top:0;border-radius:0 0 3px 3px;padding:24px;line-height:1.5;font-size:15px">
<h1 style="margin:0 0 16px;color:#3F4F25;font-size:24px;line-height:1.25;font-family:'Amatic SC','Trebuchet MS',Arial,sans-serif">${esc(title)}</h1>${body}
<p style="font-size:12px;color:#5D6F3A;margin:24px 0 0;border-top:1px solid #D5DCC8;padding-top:12px">Chez Léon, location de vélos en Touraine<br>reservationschezleon@gmail.com · 06 44 80 71 89</p>
</div></div></body></html>`;

const button = (href: string, label: string) =>
  `<p style="margin:20px 0"><a href="${esc(href)}" style="display:inline-block;background:#EAD6B5;color:#3F4F25;border:1px solid #C9B58F;padding:14px 24px;border-radius:3px;text-decoration:none;font-weight:bold;font-family:Lato,Arial,sans-serif">${esc(label)}</a></p>`;

export function confirmationEmail(d: ConfirmationData) {
  const rows = d.lines.map((l) => `<tr><td>${l.qty} × ${esc(l.label)}</td><td style="text-align:right">${euros(l.totalCents)}</td></tr>`).join("");
  const html = wrap(`Réservation ${d.number} confirmée`,
    `<p>Bonjour ${esc(d.firstName)}, bienvenue chez Léon ! Votre paiement est bien reçu ${d.counter ? "et vos vélos vous attendent à la boutique." : `et votre séjour à <strong>${esc(d.accommodation)}</strong> se prépare.`}</p>
     ${d.tip ? `<p style="background:#F4EBDB;border-radius:3px;padding:12px 16px;margin:16px 0"><strong>Le conseil de Léon</strong><br>${esc(d.tip)}</p>` : ""}
     <p><strong>${esc(d.accommodation)}</strong><br>Du ${esc(d.startLabel)}<br>Au ${esc(d.endLabel)}</p>
     <table style="width:100%;border-collapse:collapse">${rows}<tr><td><strong>Total payé</strong></td><td style="text-align:right"><strong>${euros(d.totalCents)}</strong></td></tr></table>
     ${d.counter ? pickupHtml(d.counter) : ""}
     <p><strong>Caution : ${euros(d.depositCents)}</strong> (empreinte bancaire, rien n'est débité). Vous l'autoriserez depuis votre page de réservation dans les 24 h précédant le retrait${d.counter ? " : le retrait à la boutique sera plus rapide." : " : c'est elle qui débloque votre code d'accès."}</p>
     ${button(d.link, "Ouvrir ma réservation")}`);
  const text = `Réservation ${d.number} confirmée.\nBienvenue chez Léon, ${d.firstName} !${d.tip ? `\nLe conseil de Léon : ${d.tip}` : ""}\n${d.accommodation}\nDu ${d.startLabel}\nAu ${d.endLabel}\nTotal payé : ${euros(d.totalCents)}\n${d.counter ? `${pickupText(d.counter)}\n` : ""}Caution : ${euros(d.depositCents)} (empreinte bancaire, rien n'est débité), à autoriser dans les 24 h avant le retrait.\nMa réservation : ${d.link}`;
  return { subject: `Votre réservation ${d.number} est confirmée`, html, text };
}

export function depositReminderEmail(d: Base & { depositCents: number }) {
  const html = wrap("Autorisez votre caution pour retirer votre vélo",
    `<p>Bonjour ${esc(d.firstName)}, votre location ${esc(d.number)} commence bientôt (${esc(d.startLabel)}, ${esc(d.accommodation)}).</p>
     <p>${d.counter ? "Pour un retrait rapide à la boutique" : "Pour recevoir votre code d'accès"}, autorisez la caution de <strong>${euros(d.depositCents)}</strong> : c'est une empreinte bancaire, rien n'est débité, et elle est libérée à la restitution du matériel en bon état.</p>
     ${d.counter ? pickupHtml(d.counter) : ""}
     ${button(d.link, "Autoriser la caution")}`);
  const text = `Votre location ${d.number} commence bientôt (${d.startLabel}, ${d.accommodation}).\nAutorisez la caution de ${euros(d.depositCents)} (empreinte bancaire, rien n'est débité) ${d.counter ? "pour un retrait rapide à la boutique" : "pour recevoir votre code d'accès"} :\n${d.link}${d.counter ? `\n${pickupText(d.counter)}` : ""}`;
  return { subject: `Demain : autorisez votre caution (${d.number})`, html, text };
}

export type OwnerNewReservationData = Base & {
  customerName: string; customerEmail: string; customerPhone: string;
  lines: { label: string; qty: number; totalCents: number }[]; totalCents: number; depositCents: number; adminLink: string;
};

/** Alerte envoyée au gérant à chaque nouvelle réservation payée. */
export function ownerNewReservationEmail(d: OwnerNewReservationData) {
  const rows = d.lines.map((l) => `<tr><td>${l.qty} × ${esc(l.label)}</td><td style="text-align:right">${euros(l.totalCents)}</td></tr>`).join("");
  const html = wrap(`Nouvelle réservation ${d.number}`,
    `<p><strong>${esc(d.customerName)}</strong><br>${esc(d.customerEmail)}<br>${esc(d.customerPhone)}</p>
     <p><strong>${esc(d.accommodation)}</strong><br>Du ${esc(d.startLabel)}<br>Au ${esc(d.endLabel)}</p>
     <table style="width:100%;border-collapse:collapse">${rows}<tr><td><strong>Total payé</strong></td><td style="text-align:right"><strong>${euros(d.totalCents)}</strong></td></tr></table>
     <p>Caution à autoriser par le client : ${euros(d.depositCents)}</p>
     ${button(d.adminLink, "Voir dans l'administration")}`);
  const text = `Nouvelle réservation ${d.number}.\n${d.customerName} · ${d.customerEmail} · ${d.customerPhone}\n${d.accommodation}\nDu ${d.startLabel}\nAu ${d.endLabel}\nTotal payé : ${euros(d.totalCents)}\nCaution : ${euros(d.depositCents)}\nAdministration : ${d.adminLink}`;
  return { subject: `Nouvelle réservation ${d.number} : ${d.accommodation}`, html, text };
}

export function reviewRequestEmail(d: { firstName: string; accommodation: string; number: string; link: string; googleUrl?: string }) {
  if (d.googleUrl) {
    // Boutique Chez Léon : on invite directement à laisser un avis sur la fiche Google.
    const html = wrap("Comment s'est passée votre sortie ?",
      `<p>Bonjour ${esc(d.firstName)}, merci d'avoir roulé avec Chez Léon !</p>
       <p>Chez Léon est une petite entreprise familiale à Savonnières. Votre avis sur Google aide énormément les prochains voyageurs à nous trouver et à nous faire confiance. Cela prend une minute.</p>
       ${button(d.googleUrl, "Laisser un avis sur Google")}
       <p style="font-size:13px;color:#5D6F3A">Un souci pendant votre location ? Répondez simplement à ce mail ou appelez le 06 44 80 71 89 : on veut le savoir.</p>`);
    const text = `Bonjour ${d.firstName}, merci d'avoir roulé avec Chez Léon !\nVotre avis sur Google aide énormément notre petite entreprise familiale (une minute) : ${d.googleUrl}\nUn souci ? Répondez à ce mail ou appelez le 06 44 80 71 89.`;
    return { subject: `Merci d'avoir roulé avec Chez Léon (${d.number})`, html, text };
  }
  const html = wrap("Comment s'est passée votre sortie ?",
    `<p>Bonjour ${esc(d.firstName)}, merci d'avoir roulé avec Chez Léon depuis ${esc(d.accommodation)} !</p>
     <p>Votre avis nous aide à nous améliorer et guide les prochains voyageurs. Une note et, si vous le souhaitez, quelques mots : cela prend une minute.</p>
     ${button(d.link, "Donner mon avis")}
     <p style="font-size:13px;color:#5D6F3A">Tous les avis sont publiés, bons ou moins bons, sauf s'ils sont hors sujet ou injurieux.</p>`);
  const text = `Bonjour ${d.firstName}, merci d'avoir roulé avec Chez Léon depuis ${d.accommodation} !\nDonnez votre avis (une minute) : ${d.link}`;
  return { subject: `Votre avis sur votre sortie à vélo (${d.number})`, html, text };
}

export function ownerReturnEmail(d: { number: string; accommodation: string; customerName: string; customerPhone: string; bikePhotos: number; attestedLabel: string; adminLink: string }) {
  const html = wrap(`Retour déclaré : ${d.number}`,
    `<p><strong>${esc(d.customerName)}</strong> (${esc(d.customerPhone)}) a déclaré avoir rendu ses vélos à <strong>${esc(d.accommodation)}</strong>.</p>
     <p>${d.bikePhotos} photo(s) de vélo + 1 photo de la boîte à clés, prises en direct. Attestation cochée le ${esc(d.attestedLabel)} : « J'ai cadenassé le vélo et remis la clé dans la boîte ».</p>
     <p>À faire : contrôler les photos, vérifier les vélos sur place, puis clôturer la location (libération de la caution).</p>
     ${button(d.adminLink, "Voir les photos et clôturer")}`);
  const text = `Retour déclaré : ${d.number}\n${d.customerName} (${d.customerPhone}) · ${d.accommodation}\n${d.bikePhotos} photo(s) de vélo + boîte à clés. Attestation cochée le ${d.attestedLabel}.\nContrôler et clôturer : ${d.adminLink}`;
  return { subject: `Retour déclaré ${d.number} : ${d.accommodation}`, html, text };
}

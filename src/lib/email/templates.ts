/** Gabarits d'emails (purs, testables). Tout texte variable est échappé. */
import { euros } from "@/lib/format";

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

type Base = { firstName: string; number: string; accommodation: string; startLabel: string; endLabel: string; link: string };
export type ConfirmationData = Base & { lines: { label: string; qty: number; totalCents: number }[]; totalCents: number; depositCents: number };

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
    `<p>Bonjour ${esc(d.firstName)}, votre paiement est bien reçu.</p>
     <p><strong>${esc(d.accommodation)}</strong><br>Du ${esc(d.startLabel)}<br>Au ${esc(d.endLabel)}</p>
     <table style="width:100%;border-collapse:collapse">${rows}<tr><td><strong>Total payé</strong></td><td style="text-align:right"><strong>${euros(d.totalCents)}</strong></td></tr></table>
     <p><strong>Caution : ${euros(d.depositCents)}</strong> (empreinte bancaire, rien n'est débité). Vous l'autoriserez depuis votre page de réservation dans les 24 h précédant le retrait : c'est elle qui débloque votre code d'accès.</p>
     ${button(d.link, "Ouvrir ma réservation")}`);
  const text = `Réservation ${d.number} confirmée.\n${d.accommodation}\nDu ${d.startLabel}\nAu ${d.endLabel}\nTotal payé : ${euros(d.totalCents)}\nCaution : ${euros(d.depositCents)} (empreinte bancaire, rien n'est débité), à autoriser dans les 24 h avant le retrait.\nMa réservation : ${d.link}`;
  return { subject: `Votre réservation ${d.number} est confirmée`, html, text };
}

export function depositReminderEmail(d: Base & { depositCents: number }) {
  const html = wrap("Autorisez votre caution pour retirer votre vélo",
    `<p>Bonjour ${esc(d.firstName)}, votre location ${esc(d.number)} commence bientôt (${esc(d.startLabel)}, ${esc(d.accommodation)}).</p>
     <p>Pour recevoir votre code d'accès, autorisez la caution de <strong>${euros(d.depositCents)}</strong> : c'est une empreinte bancaire, rien n'est débité, et elle est libérée à la restitution du matériel en bon état.</p>
     ${button(d.link, "Autoriser la caution")}`);
  const text = `Votre location ${d.number} commence bientôt (${d.startLabel}, ${d.accommodation}).\nAutorisez la caution de ${euros(d.depositCents)} (empreinte bancaire, rien n'est débité) pour recevoir votre code d'accès :\n${d.link}`;
  return { subject: `Demain : autorisez votre caution (${d.number})`, html, text };
}

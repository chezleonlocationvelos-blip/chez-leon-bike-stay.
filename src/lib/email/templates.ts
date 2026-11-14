/** Gabarits d'emails (purs, testables). Tout texte variable est échappé. */
import { euros } from "@/lib/format";

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

type Base = { firstName: string; number: string; accommodation: string; startLabel: string; endLabel: string; link: string };
export type ConfirmationData = Base & { lines: { label: string; qty: number; totalCents: number }[]; totalCents: number; depositCents: number };

const wrap = (title: string, body: string) =>
  `<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#26332D;background:#F7F4ED;padding:24px"><div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;padding:24px"><h1 style="color:#234F3E;font-size:22px">${esc(title)}</h1>${body}<p style="font-size:12px;color:#666;margin-top:24px">Chez Léon – location de vélos en Touraine</p></div></body></html>`;

const button = (href: string, label: string) =>
  `<p><a href="${esc(href)}" style="display:inline-block;background:#234F3E;color:#fff;padding:14px 24px;border-radius:14px;text-decoration:none;font-weight:bold">${esc(label)}</a></p>`;

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

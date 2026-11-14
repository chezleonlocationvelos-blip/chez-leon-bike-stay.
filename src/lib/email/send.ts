import "server-only";

export type SendResult = "sent" | "skipped";

/** Envoi via l'API Resend. Sans clé (RESEND_API_KEY), l'envoi est ignoré : l'application reste utilisable en démonstration. */
export async function sendEmail(to: string, msg: { subject: string; html: string; text: string }): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) { console.warn("Email ignoré : RESEND_API_KEY ou EMAIL_FROM absent."); return "skipped"; }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: msg.subject, html: msg.html, text: msg.text, reply_to: process.env.EMAIL_REPLY_TO || undefined }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
  return "sent";
}

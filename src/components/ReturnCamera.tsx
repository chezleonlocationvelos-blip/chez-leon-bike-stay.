"use client";
import { useEffect, useRef, useState } from "react";

type Props = { token: string; reservationNumber: string; needed: number; initialCount: number; declare: () => Promise<void> };

/**
 * Photo de restitution prise EN DIRECT : flux caméra (getUserMedia) → image dessinée dans un canevas → JPEG envoyé au serveur.
 * Aucune sélection de fichier ni de galerie n'est proposée. L'heure serveur fait foi ; la position est enregistrée si elle est autorisée.
 */
export function ReturnCamera({ token, reservationNumber, needed, initialCount, declare }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const stop = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; setActive(false); };
  useEffect(() => stop, []);

  async function start() {
    setMsg(null);
    if (!navigator.mediaDevices?.getUserMedia) { setMsg("Ce navigateur ne permet pas d'utiliser la caméra. Ouvrez cette page avec Chrome ou Safari sur votre téléphone."); return; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1600 } }, audio: false });
      stream.current = s;
      setActive(true);
      requestAnimationFrame(() => { if (video.current) { video.current.srcObject = s; void video.current.play(); } });
    } catch {
      setMsg("Accès à la caméra refusé. Autorisez la caméra pour ce site dans les réglages de votre navigateur, puis réessayez.");
    }
  }

  function position(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 4000, maximumAge: 60000 });
    });
  }

  async function shoot() {
    const v = video.current;
    if (!v || !v.videoWidth || busy) return;
    setBusy(true); setMsg(null);
    try {
      const scale = Math.min(1, 1280 / v.videoWidth);
      const c = document.createElement("canvas");
      c.width = Math.round(v.videoWidth * scale); c.height = Math.round(v.videoHeight * scale);
      const ctx = c.getContext("2d")!;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const stamp = `${reservationNumber} · ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`;
      ctx.font = `${Math.max(14, Math.round(c.width / 45))}px sans-serif`;
      const w = ctx.measureText(stamp).width + 16, h = Math.max(14, Math.round(c.width / 45)) + 12;
      ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, c.height - h, w, h);
      ctx.fillStyle = "#fff"; ctx.fillText(stamp, 8, c.height - 8);
      const blob: Blob | null = await new Promise((res) => c.toBlob(res, "image/jpeg", 0.75));
      if (!blob) throw new Error("blob");
      const pos = await position();
      const fd = new FormData();
      fd.set("token", token); fd.set("photo", blob, "retour.jpg");
      if (pos) { fd.set("lat", String(pos.coords.latitude)); fd.set("lng", String(pos.coords.longitude)); fd.set("acc", String(pos.coords.accuracy)); }
      const res = await fetch("/api/return-photo", { method: "POST", body: fd });
      if (!res.ok) throw new Error(String(res.status));
      const j = await res.json();
      setCount(j.count);
      if (j.count >= needed) stop();
    } catch {
      setMsg("La photo n'a pas pu être envoyée. Vérifiez votre connexion et réessayez.");
    } finally { setBusy(false); }
  }

  const btn = "inline-flex min-h-12 items-center justify-center rounded-xl2 border border-forest/30 bg-accent px-5 font-button font-bold text-forest disabled:opacity-50";
  const done = count >= needed;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-charcoal">
        Photographiez {needed > 1 ? `chacun des ${needed} vélos` : "le vélo"} cadenassé à son emplacement. La photo se prend directement ici, la galerie n'est pas utilisable.
      </p>
      <p className="font-bold text-forest" aria-live="polite">{count} photo{count > 1 ? "s" : ""} sur {needed}</p>

      {active && (
        <div className="relative overflow-hidden rounded-xl2 bg-black">
          <video ref={video} playsInline muted className="aspect-[3/4] w-full object-cover sm:aspect-video" />
          <button type="button" onClick={shoot} disabled={busy} aria-label="Prendre la photo"
            className="absolute bottom-4 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-white/30 disabled:opacity-50">
            <span className="h-10 w-10 rounded-full bg-white" />
          </button>
        </div>
      )}

      {msg && <p role="alert" className="rounded-xl2 bg-red-50 p-3 text-sm text-red-800">{msg}</p>}

      {!active && !done && <button type="button" onClick={start} className={btn}>{count === 0 ? "Ouvrir la caméra" : "Photo suivante"}</button>}
      {active && <button type="button" onClick={stop} className="text-sm underline">Fermer la caméra</button>}

      {done && (
        <form action={declare}>
          <button type="submit" className={btn}>Terminer la restitution</button>
        </form>
      )}
    </div>
  );
}

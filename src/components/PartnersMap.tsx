"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type MapPoint = { slug: string; name: string; city: string | null; lat: number; lng: number };

/** Carte des hébergements partenaires (OpenStreetMap). Positions au niveau de la commune, pas de l'adresse exacte. */
export function PartnersMap({ points }: { points: MapPoint[] }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current || points.length === 0) return;
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      const icon = L.divIcon({
        className: "",
        html: '<span style="display:block;width:22px;height:22px;border-radius:50%;background:#809758;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)"></span>',
        iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -12],
      });
      const bounds: [number, number][] = [];
      for (const p of points) {
        const popup = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = p.name;
        const link = document.createElement("a");
        link.href = `/h/${p.slug}`;
        link.textContent = "Réserver un vélo";
        link.style.cssText = "display:block;margin-top:4px;color:#3F4F25;text-decoration:underline";
        popup.append(title, document.createElement("br"), document.createTextNode(p.city ?? ""), link);
        L.marker([p.lat, p.lng], { icon, title: p.name, alt: p.name }).addTo(map).bindPopup(popup);
        bounds.push([p.lat, p.lng]);
      }
      if (bounds.length === 1) map.setView(bounds[0], 11);
      else map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    })();
    return () => { cancelled = true; map?.remove(); };
  }, [points]);

  return <div ref={el} role="region" aria-label="Carte des hébergements partenaires" className="z-0 h-72 w-full lg:h-[28rem] overflow-hidden rounded-xl2 border border-line" />;
}

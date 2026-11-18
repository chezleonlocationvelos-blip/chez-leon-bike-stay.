"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";

/** Carrousel : défilement tactile (balayage) avec accroche, flèches, points et clavier. */
export function ImageCarousel({ images }: { images: [string, string][] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const n = (i + images.length) % images.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = track.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };
  const arrow = "absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-forest shadow hover:bg-white sm:flex";

  return (
    <section
      aria-roledescription="carrousel" aria-label="Photos de l'hébergement" className="relative"
      onKeyDown={(e) => { if (e.key === "ArrowLeft") go(index - 1); if (e.key === "ArrowRight") go(index + 1); }}
    >
      <div
        ref={track} onScroll={onScroll} tabIndex={0}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-xl2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage"
      >
        {images.map(([src, alt], i) => (
          <img
            key={src} src={src} alt={alt} loading={i === 0 ? "eager" : "lazy"} draggable={false}
            aria-label={`Photo ${i + 1} sur ${images.length}`}
            className="aspect-[4/3] w-full flex-none snap-center object-cover sm:aspect-[16/9]"
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button type="button" onClick={() => go(index - 1)} aria-label="Photo précédente" className={`${arrow} left-3`}>‹</button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Photo suivante" className={`${arrow} right-3`}>›</button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2" role="group" aria-label="Choisir une photo">
            {images.map(([src], i) => (
              <button
                key={src} type="button" onClick={() => go(i)} aria-label={`Photo ${i + 1}`} aria-current={i === index}
                className={`h-2.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2.5 bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

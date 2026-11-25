/** Pictogrammes au trait, minimalistes, qui remplacent les emojis (couleur = couleur du texte courant). */
const PATHS = {
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  sunCloud: <><path d="M8 4.5v1.2M3.8 8.3H5M5 5.3l.9.9" /><path d="M9.6 10.2A3.5 3.5 0 0 1 5.1 9" /><path d="M7.5 19h9a4 4 0 0 0 .4-8 5 5 0 0 0-9.6 1.5A3.3 3.3 0 0 0 7.5 19z" /></>,
  cloud: <path d="M7 18.5h10a4.5 4.5 0 0 0 .4-9 6 6 0 0 0-11.5 2A3.5 3.5 0 0 0 7 18.5z" />,
  fog: <><path d="M7 13.5h10a4.5 4.5 0 0 0 .4-9 6 6 0 0 0-11.5 2" /><path d="M4 17h16M6 20.5h12" /></>,
  rain: <><path d="M7 14.5h10a4.5 4.5 0 0 0 .4-9 6 6 0 0 0-11.5 2A3.5 3.5 0 0 0 7 14.5z" /><path d="M8 17.5l-1 3M12 17.5l-1 3M16 17.5l-1 3" /></>,
  showers: <><path d="M5 5.5v1M2.5 8h1M3.3 3.8l.7.7" /><path d="M8 14.5h9a4 4 0 0 0 .4-8 5 5 0 0 0-9.6 1.5A3.3 3.3 0 0 0 8 14.5z" /><path d="M10 17.5l-1 3M14 17.5l-1 3" /></>,
  snow: <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 6l2.5-1.5M9.5 19.5 12 18l2.5 1.5" />,
  storm: <><path d="M7 14.5h10a4.5 4.5 0 0 0 .4-9 6 6 0 0 0-11.5 2A3.5 3.5 0 0 0 7 14.5z" /><path d="M12.5 16 10 19.5h3.5L11 23" /></>,
  bike: <><circle cx="5.5" cy="16.5" r="3.5" /><circle cx="18.5" cy="16.5" r="3.5" /><path d="M5.5 16.5 9 9h5.5l4 7.5M9 9l3.5 7.5M13 5.5h3" /></>,
  idea: <><path d="M9 18h6M10 21h4" /><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.8.7-1.5 1.6-1.5 2.5h-4c0-.9-.7-1.8-1.5-2.5z" /></>,
} as const;

export type LineIconName = keyof typeof PATHS;

export function LineIcon({ name, className = "h-5 w-5" }: { name: LineIconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`inline-block flex-none ${className}`}>
      {PATHS[name]}
    </svg>
  );
}

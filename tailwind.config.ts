import type { Config } from "tailwindcss";

// Charte reprise du site chezleonlocation.com : fond clair, vert sauge, beige.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#3F4F25",   // vert foncé : titres et textes (lisible sur fond clair)
        sage: "#809758",     // vert sauge du site : bandeaux, accents
        cream: "#F9F9F9",    // fond du site
        charcoal: "#2F3D19", // texte principal
        accent: "#EAD6B5",   // beige des boutons du site
        line: "#D5DCC8",     // contours discrets des champs et cartes
      },
      borderRadius: { xl2: "3px" },
      fontFamily: {
        sans: ["var(--font-roboto)", "Roboto", "sans-serif"],
        display: ["var(--font-amatic)", "'Amatic SC'", "sans-serif"],
        button: ["var(--font-lato)", "Lato", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

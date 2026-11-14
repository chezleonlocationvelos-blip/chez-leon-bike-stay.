import type { Config } from "tailwindcss";

// Palette proposée dans le cahier des charges, adaptable à l'identité Chez Léon.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#234F3E",
        sage: "#91A98F",
        cream: "#F7F4ED",
        charcoal: "#26332D",
        accent: "#D99A55",
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};
export default config;

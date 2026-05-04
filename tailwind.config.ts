import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        edge: {
          bg: "#0A0A0A",
          surface: "#1A1A1A",
          border: "rgba(255,255,255,0.08)",
          red: "#E8291C",
          gold: "#F5A623",
          muted: "rgba(255,255,255,0.55)",
        },
      },
      fontFamily: {
        condensed: ["Barlow Condensed", "sans-serif"],
        body: ["Barlow", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

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
          // Backgrounds
          bg:        "#0E1014",
          surface:   "#171B21",
          card:      "#13161A",
          divider:   "#252A32",
          // Accents
          bronze:    "#C8965A",
          red:       "#E8291C",
          gold:      "#F5A623",
          emerald:   "#34D399",
          // Text
          text:      "#F2F1ED",
          secondary: "#9BA3AF",
          muted:     "#3D434D",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        condensed: ["Barlow Condensed", "sans-serif"],
        body:    ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

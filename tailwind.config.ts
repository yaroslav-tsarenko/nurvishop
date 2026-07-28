import type { Config } from "tailwindcss";
import { heroui } from "@heroui/theme";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display-brand)", "system-ui", "sans-serif"],
        sans: ["var(--font-ui-brand)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        ink: "var(--color-text)",
        muted: "var(--color-text-secondary)",
        mist: "var(--color-bg-secondary)",
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          light: "var(--color-accent-light)",
        },
        pop: {
          DEFAULT: "var(--color-pop)",
          hover: "var(--color-pop-hover)",
          tint: "var(--color-pop-tint)",
        },
        blush: "var(--color-blush)",
        lilac: "var(--color-lilac)",
      },
      borderRadius: {
        pill: "var(--radius-pill)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        pop: "var(--shadow-pop)",
        accent: "var(--shadow-accent)",
      },
      maxWidth: {
        container: "1320px",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;

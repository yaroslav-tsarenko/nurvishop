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
        subtle: "var(--color-text-tertiary)",
        mist: "var(--color-bg-secondary)",
        surface: "var(--color-bg)",
        well: "var(--color-bg-tertiary)",
        page: "var(--color-page)",
        inverse: {
          DEFAULT: "var(--color-inverse-surface)",
          hover: "var(--color-inverse-surface-hover)",
          fg: "var(--color-inverse-text)",
          muted: "var(--color-inverse-muted)",
          border: "var(--color-inverse-border)",
        },
        line: {
          DEFAULT: "var(--color-border)",
          hover: "var(--color-border-hover)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          active: "var(--color-accent-active)",
          light: "var(--color-accent-light)",
        },
        pop: {
          DEFAULT: "var(--color-pop)",
          hover: "var(--color-pop-hover)",
          tint: "var(--color-pop-tint)",
          ink: "var(--color-pop-ink)",
        },
        blush: {
          DEFAULT: "var(--color-blush)",
          tint: "var(--color-blush-tint)",
        },
        lilac: {
          DEFAULT: "var(--color-lilac)",
          strong: "var(--color-lilac-strong)",
        },
        /* Warm Natural Home semantic aliases */
        clay: {
          DEFAULT: "var(--clay)",
          hover: "var(--clay-hover)",
          active: "var(--clay-active)",
        },
        sage: {
          DEFAULT: "var(--sage)",
          strong: "var(--sage-strong)",
          tint: "var(--sage-tint)",
        },
        ochre: {
          DEFAULT: "var(--ochre)",
          hover: "var(--ochre-hover)",
          tint: "var(--ochre-tint)",
        },
        linen: "var(--linen)",
        "clay-white": "var(--clay-white)",
        espresso: "var(--espresso)",
        taupe: "var(--taupe)",
        peach: "var(--peach)",
        sand: "var(--ochre-tint)",
        success: {
          DEFAULT: "var(--color-success)",
          tint: "var(--color-success-tint)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          tint: "var(--color-warning-tint)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          tint: "var(--color-danger-tint)",
        },
      },
      borderColor: {
        DEFAULT: "var(--color-border)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        blob: "var(--radius-blob)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        pop: "var(--shadow-pop)",
        accent: "var(--shadow-accent)",
      },
      transitionTimingFunction: {
        spring: "var(--ease-spring)",
        back: "var(--ease-back)",
        "out-expo": "var(--ease-out-expo)",
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

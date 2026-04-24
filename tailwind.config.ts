import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "0",
        md: "0",
        sm: "0",
      },
      colors: {
        // Brand primitives — three-color system. Use directly when you
        // mean ink/paper/yellow. Everything else goes through the
        // shadcn semantic tokens below (which resolve to ink/paper/yellow).
        ink: {
          DEFAULT: "hsl(var(--ink) / <alpha-value>)",
          // Fixed-alpha neutrals from colors_and_type.css. These are
          // rgba values — opacity modifiers (e.g. `bg-ink-12/50`) do
          // not apply; reach for the next tier instead.
          "04": "var(--ink-04)",
          "08": "var(--ink-08)",
          "12": "var(--ink-12)",
          "24": "var(--ink-24)",
          "40": "var(--ink-40)",
          "56": "var(--ink-56)",
          "72": "var(--ink-72)",
          "90": "var(--ink-90)",
        },
        paper: {
          DEFAULT: "hsl(var(--paper) / <alpha-value>)",
          "04": "var(--paper-04)",
          "08": "var(--paper-08)",
          "12": "var(--paper-12)",
          "24": "var(--paper-24)",
          "40": "var(--paper-40)",
          "56": "var(--paper-56)",
          "72": "var(--paper-72)",
          "90": "var(--paper-90)",
        },
        yellow: "hsl(var(--yellow) / <alpha-value>)",
        "yellow-ink": "hsl(var(--yellow-ink) / <alpha-value>)",
        hairline: "var(--hairline)",
        "hairline-soft": "var(--hairline-soft)",

        // Flat / base colors (regular buttons)
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)"
        },
        /* Presence / status — ink + yellow only (no chromatic greens/ambers) */
        status: {
          online: "hsl(var(--ink) / <alpha-value>)",
          away: "var(--ink-56)",
          busy: "hsl(var(--yellow) / <alpha-value>)",
          offline: "var(--ink-24)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        // Design-system type scale from colors_and_type.css.
        // Component authors should prefer these over Tailwind's defaults.
        "ds-xs":   "var(--fs-xs)",
        "ds-sm":   "var(--fs-sm)",
        "ds-base": "var(--fs-base)",
        "ds-md":   "var(--fs-md)",
        "ds-lg":   "var(--fs-lg)",
        "ds-xl":   "var(--fs-xl)",
        "ds-2xl":  "var(--fs-2xl)",
        "ds-3xl":  "var(--fs-3xl)",
        "ds-4xl":  "var(--fs-4xl)",
        "ds-5xl":  "var(--fs-5xl)",
        "ds-6xl":  "var(--fs-6xl)",
      },
      letterSpacing: {
        "ds-tight":  "var(--lt-tight)",
        "ds-xtight": "var(--lt-xtight)",
        "ds-mono":   "var(--lt-mono)",
        "ds-caps":   "var(--lt-caps)",
      },
      spacing: {
        "ds-1":  "var(--s-1)",
        "ds-2":  "var(--s-2)",
        "ds-3":  "var(--s-3)",
        "ds-4":  "var(--s-4)",
        "ds-5":  "var(--s-5)",
        "ds-6":  "var(--s-6)",
        "ds-7":  "var(--s-7)",
        "ds-8":  "var(--s-8)",
        "ds-9":  "var(--s-9)",
        "ds-10": "var(--s-10)",
      },
      boxShadow: {
        "hl-inner":   "var(--hl-inner)",
        "hl-inner-i": "var(--hl-inner-i)",
        "hl-outer":   "var(--hl-outer)",
        "hl-outer-i": "var(--hl-outer-i)",
        "lift-1":     "var(--lift-1)",
        "lift-2":     "var(--lift-2)",
        "lift-3":     "var(--lift-3)",
      },
      transitionTimingFunction: {
        ds: "var(--ease)",
      },
      transitionDuration: {
        "ds-1": "var(--dur-1)",
        "ds-2": "var(--dur-2)",
        "ds-3": "var(--dur-3)",
      },
      maxWidth: {
        container:   "var(--container)",
        "container-w": "var(--container-w)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

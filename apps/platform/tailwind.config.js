import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./agent/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
        // Paleta Brasileira Premium
        brasil: {
          navy: "oklch(0.12 0.1 240)",
          royal: "oklch(0.18 0.12 240)", 
          gold: "oklch(0.7 0.15 60)",
          amber: "oklch(0.6 0.12 60)",
          forest: "oklch(0.25 0.08 135)",
          jade: "oklch(0.35 0.1 135)",
          pearl: "oklch(0.95 0.02 60)",
          silver: "oklch(0.85 0.01 240)",
        },
        success: {
          DEFAULT: "oklch(0.35 0.1 135)",
          foreground: "oklch(0.95 0.02 60)",
        },
        warning: {
          DEFAULT: "oklch(0.6 0.12 60)",
          foreground: "oklch(0.15 0.08 240)",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "loading-dots": "loadingDots 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulseGold: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px oklch(0.7 0.15 60)" },
          "100%": { boxShadow: "0 0 20px oklch(0.7 0.15 60), 0 0 30px oklch(0.7 0.15 60)" },
        },
        loadingDots: {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}

export default config

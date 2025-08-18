import type { Config } from 'tailwindcss'
const { fontFamily } = require("tailwindcss/defaultTheme");

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./agent/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        // Paleta "Onça-Azul" - mapeamento HSL para variáveis CSS
        'brasil-blue': {
          '900': '222 71% 10%', // --background (dark)
          '800': '222 71% 12%', // --card (dark)
          '700': '217 32.6% 17.5%', // --secondary, --muted (dark)
        },
        'brasil-green': {
          '500': '151 100% 33%', // --primary (dark)
          '400': '151 100% 40%', // --ring (dark)
        },
        'brasil-gold': {
          '500': '54 100% 50%', // --primary-foreground (dark)
          '400': '54 100% 60%',
          '300': '54 100% 70%',
          '200': '54 100% 80%',
          '100': '54 100% 90%',
          '50': '54 100% 95%',
          '600': '54 100% 45%',
          '700': '54 100% 40%',
          '800': '54 100% 35%',
          '900': '54 100% 30%',
        },
        // Cores utilitárias (mantidas como hex para compatibilidade)
        'brasil-navy': '#0C1F4A',
        'brasil-royal': '#1A3A7A',
        'brasil-pearl': '#F8F9FA',
        'brasil-jade': '#00C269',
        'brasil-amber': '#FFC107',
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

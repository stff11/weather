import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#F3F6FA",
          100: "#E6ECF5",
          200: "#C9D5E6",
          300: "#9AAEC9",
          400: "#6C82A3",
          500: "#495E80",
          600: "#33456A",
          700: "#233252",
          800: "#16223B",
          900: "#0B1220",
          950: "#070B14",
        },
        sun: {
          100: "#FFE7D2",
          300: "#FFC28A",
          500: "#FF8A4C",
          600: "#F2712F",
          700: "#D6591F",
        },
        rain: {
          300: "#8FC7FF",
          500: "#3C8CE0",
          700: "#215FA8",
        },
        mist: {
          300: "#D7DEE8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
      },
      borderRadius: {
        xl2: "1.75rem",
      },
      boxShadow: {
        glass: "0 1px 0 0 rgba(255,255,255,0.08) inset, 0 8px 30px -12px rgba(11,18,32,0.35)",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        "drift-slow": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "rise": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "twinkle": {
          "0%, 100%": { opacity: "0.15" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        "drift-slow": "drift-slow 90s linear infinite",
        "rise": "rise 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "twinkle": "twinkle 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;

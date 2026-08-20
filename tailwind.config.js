/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta "Legajo": tinta institucional + papel + sello
        tinta: {
          950: "#0E2238",
          900: "var(--color-brand, #152F4A)",
          800: "#1C3D5F",
          700: "#274E76",
          600: "#33608F",
          500: "#4A7AAE",
          100: "#DCE7F2",
          50: "#F2F6FA",
        },
        papel: {
          DEFAULT: "var(--color-bg, #F7F3EA)",
          100: "#FBF9F4",
          200: "#EFE8D8",
          300: "#E3D9C1",
        },
        sello: {
          DEFAULT: "#B23A2E",
          600: "#9C3226",
          100: "#F5DEDA",
        },
        salvia: {
          DEFAULT: "#5C7A5E",
          100: "#E1E9DF",
        },
        ambar: {
          DEFAULT: "#C08A2E",
          100: "#F3E6CC",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        folio: "0 1px 2px rgba(14,34,56,0.06), 0 8px 24px -12px rgba(14,34,56,0.18)",
        glass: "0 1px 1px rgba(255,255,255,0.4) inset, 0 1px 2px rgba(14,34,56,0.03), 0 8px 22px -12px rgba(14,34,56,0.16)",
        glow: "0 8px 20px -6px rgba(178,58,46,0.35)",
        "glow-tinta": "0 8px 22px -8px rgba(14,34,56,0.4)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
        float: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(2%, -4%)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-3%, 3%) scale(1.05)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 1.6s ease-in-out infinite",
        float: "float 9s ease-in-out infinite",
        "float-slow": "float-slow 14s ease-in-out infinite",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

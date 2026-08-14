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
          900: "#152F4A",
          800: "#1C3D5F",
          700: "#274E76",
          600: "#33608F",
          500: "#4A7AAE",
          100: "#DCE7F2",
          50: "#F2F6FA",
        },
        papel: {
          DEFAULT: "#F7F3EA",
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
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

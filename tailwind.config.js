/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/client/index.html",
    "./src/client/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        goa: {
          green: "#046634",
          "green-dark": "#033E22",
          "green-light": "#0A8F4C",
          cream: "#F6F0DA",
          "cream-light": "#FFFDF4",
          pink: "#FF0077",
          "pink-light": "#FF4099",
          yellow: "#F4D000",
          "yellow-light": "#FFE642",
          black: "#101411",
          gray: {
            100: "#F0EDE4",
            200: "#E3DFD4",
            300: "#C8C4B8",
            400: "#9E9A8E",
            500: "#6B685F",
            600: "#47453F",
            700: "#2B2A26",
            800: "#1A1916",
          },
        },
      },
      fontFamily: {
        display: ["Syne", "Outfit", "system-ui", "sans-serif"],
        editorial: ["Playfair Display", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Space Mono", "Courier New", "monospace"],
      },
      boxShadow: {
        'brutal': '4px 4px 0px #101411',
        'brutal-pink': '4px 4px 0px #FF0077',
        'brutal-yellow': '4px 4px 0px #F4D000',
        'brutal-green': '4px 4px 0px #033E22',
        'brutal-sm': '2px 2px 0px #101411',
        'brutal-lg': '6px 6px 0px #101411',
      },
    },
  },
  plugins: [],
};

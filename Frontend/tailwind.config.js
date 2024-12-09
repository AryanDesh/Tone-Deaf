/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: "#0B0033",
          white: "#F1EDEE",
        },
        secondary: {
          maroon: "#832232",
        },
        accent: {
          lime: "#3EDB32",
          yellow: "#F8F32B",
        }
      },
      fontFamily: {
        "Geostar": ["Geostar"]
      },
      keyframes: {
        shootingStar: {
          "0%": {
            transform: "rotate(315deg) translateX(0)",
            opacity: 1
          },
          "70%": {
            opacity: 1
          },
          "100%": {
            transform: "rotate(315deg) translateX(-1500px)",
            opacity: 0
          }
        },
      },
      animation: {
        shootingStar: "shootingStar 3s linear infinite"
      }
    },
  },
  plugins: [],
}


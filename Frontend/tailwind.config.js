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
        lift: {
          "0%": {
            transform: "translateY(0)",
            opacity: "1",
            visibility: "visible"
          },
          "100%": {
            transform: "translateY(-100%)",
            opacity: "0",
            visibility: "hidden"
          }
        } 
      },
      animation: {
        lift: "lift 1s ease-in-out 3s",
      }
    },
  },
  plugins: [],
}


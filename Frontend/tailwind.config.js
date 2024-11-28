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
      }
    },
  },
  plugins: [],
}


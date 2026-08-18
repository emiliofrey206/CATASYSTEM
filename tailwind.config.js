/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- ¡ESTA ES LA MAGIA QUE ARREGLA EL PROBLEMA!
  theme: {
    extend: {},
  },
  plugins: [],
}

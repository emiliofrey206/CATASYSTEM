/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- ESTO DESVINCULA EL SISTEMA DEL TELÉFONO
  theme: {
    extend: {},
  },
  plugins: [],
}

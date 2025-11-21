/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Aquí definimos tus colores personalizados
      colors: {
        'brand-dark': '#664C43',      // Marrón oscuro (Texto principal, Footer)
        'brand-primary': '#873D48',   // Marrón rojizo (Navbar, Títulos destacados)
        'brand-secondary': '#DC758F', // Rosa (Botones secundarios, acentos)
        'brand-light': '#E3D3E4',     // Lavanda claro (Fondo general)
        'brand-accent': '#00FFCD',    // Cian vibrante (Botones de acción principal)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Una fuente más moderna (opcional)
      }
    },
  },
  plugins: [],
}
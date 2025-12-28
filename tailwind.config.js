/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        body: ['"Lora"', 'serif'],
        sans: ['"Lato"', 'sans-serif'],
      },
      colors: {
        background: '#1a1a1a', // Dark background as per image
        surface: '#2a2a2a',
      }
    },
  },
  plugins: [],
}

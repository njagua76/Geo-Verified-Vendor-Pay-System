/** @type {import('tailwindcss').Config} */ // TypeScript type for Tailwind config
export default {
  content: [
    "./index.html", // Include index.html for purging
    "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/TS/JSX/TSX files in src
  ],
  theme: {
    extend: {}, // Extend default theme
  },
  plugins: [], // Array of plugins
}
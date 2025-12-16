import { defineConfig } from 'vite' // Import Vite's defineConfig function
import react from '@vitejs/plugin-react' // Import React plugin for Vite
import { fileURLToPath, URL } from 'node:url' // Import utilities for URL handling

// https://vitejs.dev/config/ - Link to Vite config docs
export default defineConfig({
  plugins: [react()], // Use React plugin
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)) // Set alias for @ to src directory
    }
  }
})
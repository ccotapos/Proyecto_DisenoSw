import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Eliminamos los 'alias' y 'dedupe' manuales porque npm ya lo arregló
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Mantenemos esto para ignorar las advertencias de "use client"
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        warn(warning)
      }
    }
  }
})
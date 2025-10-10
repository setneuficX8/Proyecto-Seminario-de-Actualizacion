import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Configuraciones específicas para Mapbox GL
  optimizeDeps: {
    include: ['mapbox-gl'] // Pre-bundlea mapbox-gl para evitar problemas de carga lenta y resolución de módulos
  },
  define: {
    global: 'globalThis' // Polyfill para compatibilidad con dependencias de Node.js que esperan la variable 'global'
  }
})

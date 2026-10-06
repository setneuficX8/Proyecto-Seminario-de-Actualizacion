import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

// Fallback SPA para GitHub Pages: copia index.html a 404.html en el build, ya que
// GH Pages no reescribe rutas profundas. Nginx usa try_files y lo ignora.
function spaFallback404(): Plugin {
  return {
    name: 'spa-fallback-404',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist')
      const indexHtml = path.join(distDir, 'index.html')
      const notFoundHtml = path.join(distDir, '404.html')
      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, notFoundHtml)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // En serve (pnpm dev) se sirve desde "/" para que las rutas del cliente
  // (/mapa, /gestion-*) coincidan con la URL. En build se usa el subdirectorio de
  // GitHub Pages como RUTA (no URL absoluta), de modo que import.meta.env.BASE_URL
  // sea un pathname válido para <BrowserRouter basename={BASE_URL}>.
  // El build de Docker sobreescribe con `vite build --base=/`.
  base: command === 'build'
    ? '/Proyecto-Seminario-de-Actualizacion/'
    : '/',
  plugins: [react(), tailwindcss(), spaFallback404()],
  resolve: {
    // Alias "@" -> /src (mantener en sync con tsconfig.app.json "paths")
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Configuraciones específicas para Mapbox GL
  optimizeDeps: {
    include: ['mapbox-gl'] // Pre-bundlea mapbox-gl para evitar problemas de carga lenta y resolución de módulos
  },
  define: {
    global: 'globalThis' // Polyfill para compatibilidad con dependencias de Node.js que esperan la variable 'global'
  },
  build: {
    rollupOptions: {
      output: {
        // Aísla Mapbox (mapbox-gl, @mapbox/mapbox-gl-directions y @mapbox/polyline)
        // en su propio chunk para que no infle el bundle principal ni el de la vista Mapa.
        manualChunks(id) {
          // El helper de interoperabilidad CJS de Vite se comparte entre el entry y
          // Mapbox. Si no se aísla aparte, Rollup lo mete en vendor-mapbox y el entry
          // termina importando (y Vite precargando) todo Mapbox en la carga inicial.
          if (id.includes('commonjsHelpers')) return 'vendor-commonjs'
          if (
            id.includes('node_modules') &&
            (id.includes('mapbox-gl') || id.includes('@mapbox/polyline'))
          ) {
            return 'vendor-mapbox'
          }
        }
      }
    }
  }
}))

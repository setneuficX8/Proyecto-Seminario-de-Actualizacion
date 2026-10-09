import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    // Mismo alias que vite.config.ts (@ -> /src) para que los tests resuelvan
    // los imports con alias de hooks/servicios.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: [
      'node_modules/**',
      'dist/**',
      'supabase/**',
      'src/Supabase/functions/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        'supabase/**',
        'src/Supabase/functions/**',
        // Infra / bootstrap (0% por requerimiento)
        'src/Supabase/Conection.{js,ts}',
        'src/main.{js,jsx,ts,tsx}',
        'src/App.{js,jsx,ts,tsx}',
      ],
    },
  },
});

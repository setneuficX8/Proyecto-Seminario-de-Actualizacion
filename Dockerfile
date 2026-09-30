# syntax=docker/dockerfile:1

# =============================================================================
# Dockerfile multi-stage con DOS propósitos:
#   - development -> servidor de Vite con Hot Reload (lo usa docker-compose.yml)
#   - production  -> Nginx sirviendo los estáticos compilados (target por defecto)
#
# `docker build .` (sin --target) construye `production`, porque es la ÚLTIMA
# etapa. Por eso `development` va ANTES: el orden importa.
#
# IMPORTANTE (seguridad): las variables VITE_* de la etapa `builder` se incrustan
# en el bundle público del cliente (el JavaScript que descarga el navegador).
# Pasa SOLO valores públicos (la anon key de Supabase y el token de Mapbox ya lo
# son). NUNCA pases secretos de servidor (p. ej. la service_role key).
# =============================================================================

# -----------------------------------------------------------------------------
# Etapa `deps` — dependencias instaladas (base compartida por dev y prod)
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps

WORKDIR /app

# pnpm fijado a la versión del proyecto (pnpm-lock.yaml, lockfileVersion 9.0).
RUN corepack enable \
    && corepack prepare pnpm@11.1.2 --activate

# Copiar primero los manifiestos para aprovechar la caché de capas de Docker:
# mientras no cambien, "pnpm install" no se vuelve a ejecutar.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Etapa `development` — servidor de Vite con Hot Reload (docker-compose.yml)
# -----------------------------------------------------------------------------
# El código fuente NO se copia: se monta con un bind mount (ver compose) para
# que los cambios se reflejen al instante. --host 0.0.0.0 lo hace accesible
# desde el host y --base=/ evita el "base" de GitHub Pages de vite.config.ts.
FROM deps AS development

EXPOSE 5173

CMD ["pnpm", "dev", "--host", "0.0.0.0", "--base=/"]

# -----------------------------------------------------------------------------
# Etapa `builder` — compilación estática para producción
# -----------------------------------------------------------------------------
FROM deps AS builder

# Copiar el código fuente. Respeta .dockerignore: .env y node_modules quedan
# fuera del contexto.
COPY . .

# Variables de build de Vite. Se declaran SIN valores por defecto para no
# versionar nada sensible en este archivo; se pasan con --build-arg.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_MAPBOX_TOKEN
ARG VITE_API_BASE
ARG VITE_PERFIL_ID

# Falla temprano si faltan las variables imprescindibles: Conection.js las lee
# al importar y un bundle sin ellas deja la app en blanco.
RUN set -eu; \
    : "${VITE_SUPABASE_URL:?Falta el build-arg VITE_SUPABASE_URL}"; \
    : "${VITE_SUPABASE_ANON_KEY:?Falta el build-arg VITE_SUPABASE_ANON_KEY}"

# Las variables se pasan inline (no vía ENV) para no persistirlas en el historial
# de capas. --base=/ es necesario: vite.config.ts fija "base" a la URL de GitHub
# Pages, que rompería la carga de assets al servir desde la raíz.
RUN VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
    VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
    VITE_MAPBOX_TOKEN="$VITE_MAPBOX_TOKEN" \
    VITE_API_BASE="$VITE_API_BASE" \
    VITE_PERFIL_ID="$VITE_PERFIL_ID" \
    pnpm exec vite build --base=/

# -----------------------------------------------------------------------------
# Etapa `production` — Nginx sirviendo los estáticos (TARGET POR DEFECTO)
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS production

# Configuración propia de Nginx, tomada desde docker/nginx.conf del contexto.
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Sólo los estáticos compilados. Ni código fuente, ni node_modules, ni .env.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]

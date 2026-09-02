# SkyStream — container image for self-hosted deploys (Coolify on Launchpad).
#
#   docker build --build-arg NEXT_PUBLIC_TMDB_API_KEY=<key> -t skystream .
#
# NEXT_PUBLIC_* values are inlined by Next.js at build time, so the TMDB key is
# a build argument, not a runtime variable. It is public by design — the browser
# calls TMDB directly with it. See .env.example for the full contract.

ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=10.26.0

# --- Stage 1: install dependencies ------------------------------------------
FROM node:${NODE_VERSION} AS deps
ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app
COPY .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Stage 2: build ---------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public config. Only the TMDB key has no safe default; the rest
# mirror .env.production so an image built without them still works.
ARG NEXT_PUBLIC_TMDB_API_KEY=""
ARG NEXT_PUBLIC_TMDB_BASE_URL="https://api.themoviedb.org/3"
ARG NEXT_PUBLIC_VIDSRC_BASE_URL="https://vidsrcme.ru"
ARG NEXT_PUBLIC_GA_TRACKING_ID="G-CR3ZVV9BE1"
ARG NEXT_PUBLIC_APP_VERSION="2.0.0"
ENV NEXT_PUBLIC_TMDB_API_KEY=${NEXT_PUBLIC_TMDB_API_KEY} \
    NEXT_PUBLIC_TMDB_BASE_URL=${NEXT_PUBLIC_TMDB_BASE_URL} \
    NEXT_PUBLIC_VIDSRC_BASE_URL=${NEXT_PUBLIC_VIDSRC_BASE_URL} \
    NEXT_PUBLIC_GA_TRACKING_ID=${NEXT_PUBLIC_GA_TRACKING_ID} \
    NEXT_PUBLIC_APP_VERSION=${NEXT_PUBLIC_APP_VERSION} \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN pnpm build

# --- Stage 3: runtime -------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# The standalone bundle already contains the traced runtime deps; .next/static
# and public are not traced and copy separately.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static/ ./.next/static/
COPY --from=builder --chown=nextjs:nodejs /app/public/ ./public/

USER nextjs
EXPOSE 3000

# Standalone entrypoint — equivalent to `next start`, without needing the CLI.
CMD ["node", "server.js"]

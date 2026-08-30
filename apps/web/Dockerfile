# SkyStream web — container image for self-hosted deploys (Coolify).
#
# Build from the REPOSITORY ROOT, not from apps/web:
#   docker build -f apps/web/Dockerfile \
#     --build-arg NEXT_PUBLIC_TMDB_API_KEY=<key> -t skystream-web .
#
# NEXT_PUBLIC_* values are inlined by Next.js at build time, so the TMDB key is
# a build argument, not a runtime variable. It is public by design — the browser
# calls TMDB directly with it. See apps/web/.env.example for the full contract.

ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=10.26.0
ARG TURBO_VERSION=2.9.16

# --- Stage 1: prune the workspace down to `web` and its deps -----------------
# `turbo prune --docker` splits the result into out/json (manifests + lockfile,
# the cacheable install layer) and out/full (sources). apps/mobile never enters
# any later stage.
FROM node:${NODE_VERSION} AS pruner
ARG PNPM_VERSION
ARG TURBO_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /repo
COPY . .
RUN pnpm dlx turbo@${TURBO_VERSION} prune web --docker

# --- Stage 2: install dependencies ------------------------------------------
FROM node:${NODE_VERSION} AS deps
ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /repo
# .npmrc carries node-linker=hoisted / shamefully-hoist; `turbo prune` does not
# copy it, and installing without it produces a different node_modules layout.
COPY .npmrc ./
COPY --from=pruner /repo/out/json/ ./
RUN pnpm install --frozen-lockfile

# --- Stage 3: build ---------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
ARG PNPM_VERSION
ARG TURBO_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /repo
COPY .npmrc ./
COPY --from=deps /repo/ ./
COPY --from=pruner /repo/out/full/ ./

# Build-time public config. Only the TMDB key has no safe default; the rest
# mirror apps/web/.env.production so an image built without them still works.
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

RUN pnpm dlx turbo@${TURBO_VERSION} run build --filter=web

# --- Stage 4: runtime -------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# The standalone bundle already contains the traced runtime deps (including the
# workspace packages); .next/static and public are not traced and copy separately.
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone/ ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static/ ./apps/web/.next/static/
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public/ ./apps/web/public/

USER nextjs
EXPOSE 3000

# Standalone entrypoint — equivalent to `next start`, without needing the CLI.
CMD ["node", "apps/web/server.js"]

# syntax=docker/dockerfile:1.7

# ─── Stage 1: deps (prod + dev for build) ───────────────────────────────────
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ─── Stage 2: build (vite client + esbuild server bundle) ───────────────────
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# ─── Stage 3: prod-only deps ────────────────────────────────────────────────
FROM node:20-bookworm-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

# ─── Stage 4: runtime ───────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080 \
    NPM_CONFIG_UPDATE_NOTIFIER=false

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates tini wget \
 && rm -rf /var/lib/apt/lists/*

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/attached_assets ./attached_assets

RUN addgroup --system --gid 1001 nodeapp \
 && adduser  --system --uid 1001 --gid 1001 nodeapp \
 && chown -R nodeapp:nodeapp /app
USER nodeapp

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/healthz || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/index.cjs"]

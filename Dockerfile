# syntax=docker/dockerfile:1

# =========================
# BASE
# =========================

FROM node:22-slim AS base

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"


# =========================
# DEPENDENCIES
# =========================

FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile


# =========================
# BUILDER
# =========================

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Generate Prisma Client
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    pnpm prisma generate

# Build Next.js
RUN pnpm build


# =========================
# RUNNER
# =========================

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV STORAGE_DIR=/app/.storage

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs \
    && mkdir -p /app/.storage \
    && chown -R nextjs:nodejs /app

# IMPORTANT: Darakub should attach a persistent volume to this path.
VOLUME ["/app/.storage"]


# =========================
# NEXT.JS
# =========================

COPY --from=builder /app/.next/standalone ./

COPY --from=builder /app/.next/static ./.next/static


# =========================
# PRISMA
# =========================

# Prisma CLI + engines + dependencies
COPY --from=deps /app/node_modules ./node_modules

# Prisma schema
COPY --from=builder /app/prisma ./prisma


# =========================
# STARTUP SCRIPT
# =========================

COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh \
    && chown -R nextjs:nodejs /app \
    && chown nextjs:nodejs /docker-entrypoint.sh


# =========================
# USER / PORT
# =========================

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]

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

# Extremely low-resource build environment
ENV NEXT_WORKER_THREADS=1
ENV NEXT_PRIVATE_BUILD_WORKER=1
ENV RAYON_NUM_THREADS=1
ENV UV_THREADPOOL_SIZE=1
ENV CARGO_BUILD_JOBS=1
ENV CARGO_BUILD_PIPELINING=false
ENV MAKEFLAGS="-j1"


# =========================
# DEPENDENCIES
# =========================
FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --prefer-offline


# =========================
# BUILDER
# =========================
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma client generation
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    pnpm prisma generate

# Build with minimal concurrency
RUN NODE_OPTIONS="--max-old-space-size=1024" \
    DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    pnpm build


# =========================
# RUNNER
# =========================
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs


# =========================
# NEXT.JS
# =========================

COPY --from=builder /app/.next/standalone ./

COPY --from=builder /app/.next/static ./.next/static


# =========================
# PRISMA
# =========================

# Full node_modules is intentional:
# Prisma CLI needs @prisma/engines and related dependencies.
COPY --from=deps /app/node_modules ./node_modules

COPY --from=builder /app/prisma ./prisma


# =========================
# STARTUP
# =========================

COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh \
    && chown -R nextjs:nodejs /app \
    && chown nextjs:nodejs /docker-entrypoint.sh


# =========================
# USER
# =========================

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
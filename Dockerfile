# syntax=docker/dockerfile:1

# ---- base ----
FROM node:22-slim AS base

# Install required system dependencies
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Enable Corepack for pnpm
RUN corepack enable

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Limit build-time concurrency for constrained Docker environments
ENV NEXT_WORKER_THREADS=1
ENV RAYON_NUM_THREADS=1
ENV UV_THREADPOOL_SIZE=1
ENV CARGO_BUILD_JOBS=1


# ---- deps ----
FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --prefer-offline


# ---- builder ----
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    pnpm prisma generate

# Build Next.js
RUN pnpm build


# ---- runner ----
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Required runtime libraries
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy standalone Next.js build
COPY --from=builder /app/.next/standalone ./

# Copy static assets
COPY --from=builder /app/.next/static ./.next/static

# Give ownership to the application user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
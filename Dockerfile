# ── Stage 1: Base ──────────────────────────────────────────────
FROM node:22-slim AS base
ENV CI=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV COREPACK_NPM_REGISTRY=https://registry.npmmirror.com

RUN corepack enable

# ── Stage 2: Dependencies ──────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --prefer-offline

# ── Stage 3: Builder ───────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN corepack enable

RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    pnpm prisma generate

RUN pnpm build

# ── Stage 4: Runner ────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# کپی کل پروژه (بدون standalone)
COPY --from=builder --chown=nextjs:nodejs /app ./

USER nextjs
EXPOSE 3000
CMD ["pnpm", "start"]
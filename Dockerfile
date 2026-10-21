# ── Stage 1: Base ──────────────────────────────────────────────
FROM node:20-slim AS base
ENV CI=true
ENV NEXT_TELEMETRY_DISABLED=1

# ── Stage 2: Dependencies ──────────────────────────────────────
FROM base AS deps
WORKDIR /app

# نصب pnpm از رجیستری در دسترس
RUN npm install -g pnpm@10 --registry=https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# مرحله ۱: دانلود پکیج‌ها (قابل کش بین بیلدها)
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm fetch

# مرحله ۲: نصب آفلاین از کش (بدون نیاز به شبکه)
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --offline

# ── Stage 3: Builder ───────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm@10 --registry=https://registry.npmmirror.com

# تولید Prisma Client با یک DATABASE_URL موقت
# (چون prisma.config.ts در زمان generate به آن نیاز دارد)
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    pnpm prisma generate

# بیلد Next.js در حالت standalone
RUN pnpm build

# ── Stage 4: Runner ────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# کاربر غیر root برای امنیت
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# کپی خروجی standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# کپی Prisma (برای جلوگیری از خطای PrismaClientInitializationError)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
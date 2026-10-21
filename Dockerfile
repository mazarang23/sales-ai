# ── Stage 1: Base ──────────────────────────────────────────────
FROM node:20-slim AS base
ENV CI=true
ENV NEXT_TELEMETRY_DISABLED=1

# ── Stage 2: Dependencies ──────────────────────────────────────
FROM base AS deps
WORKDIR /app

# نصب pnpm از رجیستری در دسترس (npmmirror معمولاً از ایران/آلمان در دسترس است)
RUN npm install -g pnpm@10 --registry=https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# نصب مستقیم با prefer-offline (اگر پکیجی در کش نبود، از شبکه می‌گیرد)
# و اسکریپت‌های lifecycle را اجرا می‌کند
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# ── Stage 3: Builder ───────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm@10 --registry=https://registry.npmmirror.com

# تولید Prisma Client با DATABASE_URL موقت
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    pnpm prisma generate

# بیلد Next.js
RUN pnpm build

# ── Stage 4: Runner ────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# کپی Prisma برای جلوگیری از خطای PrismaClientInitializationError
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
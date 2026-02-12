# ---- Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate --schema=libs/db-prisma/prisma/schema.prisma

RUN npx nx build api

# ---- Runner ----
FROM node:20-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/dist/apps/api/package.json ./
COPY --from=builder /app/dist/apps/api/pnpm-lock.yaml* /app/dist/apps/api/package-lock.json* ./

RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

COPY --from=builder /app/dist/apps/api/main.js ./
COPY --from=builder /app/libs/db-prisma/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD ["node", "main.js"]

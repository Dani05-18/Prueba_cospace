# Dockerfile para CoSpace (Next.js 16 con Prisma)
FROM node:20-alpine AS base

# 1. Instalar dependencias
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# 2. Compilar aplicación y generar cliente de Prisma
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# 3. Contenedor final de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "run", "start"]


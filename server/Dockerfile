# Stage 1: build (compile TypeScript to JavaScript)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: run (production dependencies + compiled code only)
FROM node:22-alpine
# Prisma needs OpenSSL, not included in Alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
COPY --from=builder /app/dist ./dist
RUN npx prisma generate
EXPOSE 8080
CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/index.js"]

# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec nx build api

# Run stage
FROM node:22-alpine
RUN apk add --no-cache wget
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/apps/api/migrations ./apps/api/migrations
EXPOSE 3000
# Run migrations then start the API (migrations are idempotent)
CMD ["sh", "-c", "node scripts/run-migrations.mjs && exec node dist/main.js"]

# Dev-only: runs DB migrations when starting the stack with docker-compose.
# Build from repo root: docker build -f dev/migrations/Dockerfile .
FROM node:22-alpine
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY scripts ./scripts
COPY apps/api/migrations ./apps/api/migrations
CMD ["node", "scripts/run-migrations.mjs"]

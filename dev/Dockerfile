# Dev image for running api and frontend with live reload.
# Source is mounted at runtime; no build step needed.
FROM node:22-alpine
WORKDIR /app
RUN corepack enable pnpm
# Install dependencies only (source mounted at runtime)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
# Copy config files needed at runtime
COPY nx.json tsconfig*.json ./
COPY apps/api/project.json apps/api/tsconfig*.json ./apps/api/
COPY apps/frontend/project.json apps/frontend/tsconfig.json apps/frontend/next.config.mjs ./apps/frontend/

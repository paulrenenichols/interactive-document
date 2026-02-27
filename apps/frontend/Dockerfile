# Build stage (run from repo root: docker build -f apps/frontend/Dockerfile .)
FROM node:22-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx nx build frontend

# Run stage: Next.js standalone
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./.next/static
COPY --from=builder /app/apps/frontend/public ./public
EXPOSE 3000
CMD ["node", "server.js"]

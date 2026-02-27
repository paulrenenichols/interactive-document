# Interactive Presentation

Create and view presentations with interactive charts. Monorepo: Next.js frontend and Fastify API, with PostgreSQL.

## Overview

- **Frontend** (`apps/frontend`) — Next.js App Router. Login/register, edit and view routes; JWT stored in localStorage; API client sends `Authorization: Bearer <token>` and redirects to login on 401.
- **API** (`apps/api`) — Fastify JSON API. Auth (register, login, JWT), decks and slides, permissions (`canEditDeck`, `canViewDeck`). PostgreSQL with raw SQL.

## How to run

### Local (no Docker)

1. **Install:** `pnpm install`
2. **Database:** Start PostgreSQL (e.g. local install or Docker only for db). Create DB and run migrations:
   - `DATABASE_URL=postgres://user:pass@localhost:5432/interactive_document pnpm run migrate`
3. **API:** In `apps/api` create `.env` with `DATABASE_URL`, `JWT_SECRET`, and optional `PORT`. From root: `pnpm run serve:api` (default port 3000).
4. **Frontend:** In `apps/frontend` create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3000`. From root: `pnpm run serve:frontend` (default port 3000; may conflict with API — use different port or run API on another port).

### Docker

- **Start stack:** `pnpm start` (or `docker compose up -d`). Frontend: http://localhost:3000, API: http://localhost:3001.
- **Stop:** `pnpm stop` (or `docker compose down`).

Set `JWT_SECRET` for the API (e.g. in `docker-compose.yml` or env file) for auth to work.

## Links

- [API README](apps/api/README.md) — setup, routes, migrations
- [Frontend README](apps/frontend/README.md) — setup, run, structure

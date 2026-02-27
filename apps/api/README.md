# API (Fastify)

Fastify JSON API for the Interactive Presentation app. **Scaffold phase (01-setup):** health route, migrations, and DB schema only; no auth or feature routes yet. Handles auth (JWT), decks, slides, data sources, and permissions. Uses PostgreSQL with raw SQL only (no ORM).

## Setup

- From repo root: `pnpm install`.
- Env: create `apps/api/.env` or set in shell:
  - `DATABASE_URL` — PostgreSQL connection string (e.g. `postgres://user:pass@localhost:5432/dbname`). Optional for health route; required for DB features.
  - `PORT` — Server port (default 3000).

## Commands

- **Build:** `nx build api` (or `pnpm run build:api` from root). Output: `apps/api/dist/`.
- **Run:** `nx serve api` (or `pnpm run serve:api` from root). Runs `node dist/main.js`; ensure DB is up if using DB routes.

## Migrations

- Migrations are in `apps/api/migrations/` (number-prefixed `.sql` files).
- **Run migrations:** from repo root, set `DATABASE_URL` then run:
  - `pnpm run migrate` — runs `node scripts/run-migrations.mjs` (uses `pg`).
  - Or manually: `psql $DATABASE_URL -f apps/api/migrations/001_initial.sql`.
- Optional: run migrations on API startup in dev (not done in scaffold).

## Routes (scaffold)

- `GET /` — Root; returns `{ ok: true, message: 'API' }`.
- `GET /health` — Health check; returns `{ ok: true, database: 'configured' | 'not configured' }` (does not connect to DB yet).

Later phases add auth, decks, slides, and data_sources routes.

## Docker

- From repo root: `pnpm start` starts the full stack (frontend, api, db) in the background; `pnpm stop` stops it. Or `docker compose build api` then `docker compose up` to build and run. API uses `DATABASE_URL` from Compose; depends on `db` service.

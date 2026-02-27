# API (Fastify)

Fastify JSON API for the Interactive Presentation app. Handles auth (JWT), decks, slides, data sources, and permissions. Uses PostgreSQL with raw SQL only (no ORM).

## Setup

- From repo root: `npm install`.
- Env: create `apps/api/.env` or set in shell:
  - `DATABASE_URL` — PostgreSQL connection string (e.g. `postgres://user:pass@localhost:5432/dbname`). Optional for health route; required for DB features.
  - `PORT` — Server port (default 3000).

## Commands

- **Build:** `nx build api` (or `npm run build:api` from root). Output: `apps/api/dist/`.
- **Run:** `nx serve api` (or `npm run serve:api` from root). Runs `node dist/main.js`; ensure DB is up if using DB routes.

## Routes (scaffold)

- `GET /` — Root; returns `{ ok: true, message: 'API' }`.
- `GET /health` — Health check; returns `{ ok: true, database: 'configured' | 'not configured' }` (does not connect to DB yet).

Later phases add auth, decks, slides, and data_sources routes.

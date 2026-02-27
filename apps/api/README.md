# API (Fastify)

Fastify JSON API for the Interactive Presentation app. Handles auth (JWT), decks, slides, and permissions. Uses PostgreSQL with raw SQL (no ORM).

## Setup

- From repo root: `pnpm install`.
- Env: create `apps/api/.env` or set in shell:
  - `DATABASE_URL` — PostgreSQL connection string (required for DB and auth).
  - `JWT_SECRET` — Secret for signing JWTs (required for auth).
  - `PORT` — Server port (default 3000).

## Commands

- **Build:** `nx build api` (or `pnpm run build:api` from root). Output: `apps/api/dist/`.
- **Run:** `nx serve api` (or `pnpm run serve:api` from root). Ensure DB is up and migrations are run.

## Migrations

- Migrations are in `apps/api/migrations/` (number-prefixed `.sql` files).
- **Run migrations:** from repo root, set `DATABASE_URL` then run:
  - `pnpm run migrate`
  - Or: `psql $DATABASE_URL -f apps/api/migrations/001_initial.sql`.

## Routes

- **Root / health:** `GET /`, `GET /health`.
- **Auth:** `POST /auth/register` (body: `email`, `password`), `POST /auth/login` (body: `email`, `password`). Both return `{ token, user }` on success.
- **Decks:**  
  - `GET /decks` — List decks owned by the authenticated user (JWT required).  
  - `POST /decks` — Create a deck (JWT required).  
  - `GET /decks/:deckId` — Get deck (view permission: public, or restricted with allow-list/share token or owner). Optional `Authorization: Bearer` and optional query `?token=` for share token.  
  - `PATCH /decks/:deckId` — Update deck (JWT + edit permission = owner).  
  - `GET /decks/:deckId/slides` — List slides (same view permission as deck).

Protected routes return 401 on missing/invalid JWT; 403 when authenticated but without permission.

## Docker

- From repo root: `pnpm start` runs the full stack. API uses `DATABASE_URL` from Compose; set `JWT_SECRET` for auth.

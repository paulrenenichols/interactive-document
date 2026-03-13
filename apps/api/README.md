# API (Fastify)

Fastify JSON API for the Interactive Presentation app. Handles auth (JWT), decks/slides/blocks CRUD, data sources with CSV upload, and permissions. Uses PostgreSQL with raw SQL (no ORM).

## Setup

- From repo root: `pnpm install`.
- Env: create `apps/api/.env` or set in shell:
  - `DATABASE_URL` — PostgreSQL connection string (required for DB and auth).
  - `JWT_SECRET` — Secret for signing JWTs (required for auth).
  - `PORT` — Server port (default 3000).
  - `CORS_ORIGINS` — (Production only.) Comma-separated list of allowed frontend origins. Leave unset for local dev.
  - `LOG_LEVEL` — Log verbosity: `error`, `warn`, `info` (default), `debug`. Set to `debug` for verbose logging in dev.

## Commands

- **Build:** `nx build api` (or `pnpm run build:api` from root). Output: `apps/api/dist/`.
- **Run:** `nx serve api` (or `pnpm run serve:api` from root). Ensure DB is up and migrations are run.
- **Lint:** `pnpm lint` (workspace) or `nx run api:lint`.
- **Tests:** `pnpm test` (workspace) or `nx run api:test` (Vitest).

## Migrations

- Migrations are in `apps/api/migrations/` (number-prefixed `.sql` files).
- **Run migrations:** from repo root, set `DATABASE_URL` then run:
  - `pnpm run migrate`
  - Or run each migration manually: `psql $DATABASE_URL -f apps/api/migrations/001_initial.sql`, etc.

## API Documentation

Interactive API docs (Swagger UI) are available at `/docs` when the server is running. The OpenAPI spec is auto-generated from route definitions.

- **Local:** http://localhost:3001/docs (when running via Docker)
- **Dev:** http://localhost:3000/docs (when running directly)

## Routes

- **Root / health:** `GET /`, `GET /health`.
- **Auth:** `POST /auth/register` (body: `email`, `password`), `POST /auth/login` (body: `email`, `password`). Both return `{ token, user }` on success.
- **Decks:**  
  - `GET /decks` — List decks owned by the authenticated user (JWT required).  
  - `POST /decks` — Create a deck (JWT required).  
  - `GET /decks/:deckId` — Get deck (view permission: public, or restricted with allow-list/share token or owner). Optional `Authorization: Bearer` and optional query `?token=` for share token.  
  - `PATCH /decks/:deckId` — Update deck (JWT + edit permission = owner).  
  - `DELETE /decks/:deckId` — Delete deck (JWT + edit permission).  
  - `GET /decks/:deckId/slides` — List slides (same view permission as deck).  
  - `POST /decks/:deckId/slides` — Create slide (JWT + edit permission).  
  - `PATCH /decks/:deckId/slides/reorder` — Reorder slides (body: `{ slideIds }`).  
  - `GET /decks/:deckId/slides/:slideId` — Get slide.  
  - `PATCH /decks/:deckId/slides/:slideId` — Update slide.  
  - `DELETE /decks/:deckId/slides/:slideId` — Delete slide.
- **Blocks:**  
  - `GET /decks/:deckId/slides/:slideId/blocks` — List blocks.  
  - `POST /decks/:deckId/slides/:slideId/blocks` — Create block (body: `type`, `layout`, `content`, etc.).  
  - `PATCH /decks/:deckId/slides/:slideId/blocks/reorder` — Reorder blocks (body: `{ blockIds }`).  
  - `GET /decks/:deckId/slides/:slideId/blocks/:blockId` — Get block.  
  - `PATCH /decks/:deckId/slides/:slideId/blocks/:blockId` — Update block.  
  - `DELETE /decks/:deckId/slides/:slideId/blocks/:blockId` — Delete block.
- **Data sources:**  
  - `GET /data-sources` — List data sources (JWT required). Optional query `?deckId=`.  
  - `POST /data-sources/upload` — Upload CSV (multipart). Optional query `?deckId=`, `?name=`.  
  - `GET /data-sources/:dataSourceId` — Get data source.  
  - `GET /data-sources/:dataSourceId/rows` — Get rows (optional `?limit=`, `?offset=`).

Protected routes return 401 on missing/invalid JWT; 403 when authenticated but without permission.

## Docker

- **Production:** From repo root: `pnpm start` runs the full stack. API uses `DATABASE_URL` from Compose; set `JWT_SECRET` for auth.
- **Dev mode:** `pnpm dev` from repo root. API runs with `tsx watch` for live reload; no image rebuild needed on code changes. Database is seeded with sample data automatically.

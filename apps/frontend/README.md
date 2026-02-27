# Frontend (Next.js)

Next.js application (App Router) for the Interactive Presentation app. **Scaffold phase (01-setup):** runnable with Nx and Docker; landing page and env wiring only. All data is loaded from the Fastify API; this app handles the UI for edit and view modes.

## Setup

- From repo root: `pnpm install` (dependencies are at workspace root).
- Copy env: create `apps/frontend/.env.local` with:
  - `NEXT_PUBLIC_API_URL` — base URL of the API (e.g. `http://localhost:3000` for local dev, or `http://api:3000` when running in Docker).

## Commands

- **Build:** `nx build frontend` (or `pnpm run build:frontend` from root).
- **Dev server:** `nx serve frontend` (or `pnpm run serve:frontend` from root). Default port 3000; ensure it does not conflict with the API.

## Docker

- From repo root: `pnpm start` starts the full stack (frontend, api, db) in the background; `pnpm stop` stops it. Or `docker compose build frontend` then `docker compose up` to build and run. Frontend is at http://localhost:3000, API at http://localhost:3001.

## Structure

- `app/` — App Router: `layout.tsx`, `page.tsx`, and future routes (e.g. `edit/[...deckId]`, `view/[deckId]`).

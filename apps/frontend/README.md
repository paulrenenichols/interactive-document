# Frontend (Next.js)

Next.js application (App Router) for the Interactive Presentation app. **Scaffold phase (01-setup):** runnable with Nx and Docker; landing page and env wiring only. All data is loaded from the Fastify API; this app handles the UI for edit and view modes.

## Setup

- From repo root: `npm install` (dependencies are at workspace root).
- Copy env: create `apps/frontend/.env.local` with:
  - `NEXT_PUBLIC_API_URL` — base URL of the API (e.g. `http://localhost:3000` for local dev, or `http://api:3000` when running in Docker).

## Commands

- **Build:** `nx build frontend` (or `npm run build:frontend` from root).
- **Dev server:** `nx serve frontend` (or `npm run serve:frontend` from root). Default port 3000; ensure it does not conflict with the API.

## Docker

- From repo root: `docker compose build frontend` builds the image. `docker compose up` runs frontend with `NEXT_PUBLIC_API_URL` set via build arg (e.g. `http://localhost:3001` so the browser can call the API).

## Structure

- `app/` — App Router: `layout.tsx`, `page.tsx`, and future routes (e.g. `edit/[...deckId]`, `view/[deckId]`).

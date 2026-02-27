# Frontend (Next.js)

Next.js application (App Router) for the Interactive Presentation app. Login and register, edit and view routes; all data from the Fastify API. JWT stored in localStorage; API client sends `Authorization: Bearer <token>` and redirects to login on 401.

## Setup

- From repo root: `pnpm install`.
- Copy env: create `apps/frontend/.env.local` with:
  - `NEXT_PUBLIC_API_URL` — base URL of the API (e.g. `http://localhost:3000` for local dev, or `http://localhost:3001` when API runs on a different port or in Docker).

## Commands

- **Build:** `nx build frontend` (or `pnpm run build:frontend` from root).
- **Dev server:** `nx serve frontend` (or `pnpm run serve:frontend` from root). Default port 3000.

## Structure

- `app/` — App Router: `layout.tsx`, `page.tsx`, `login/page.tsx`, `register/page.tsx`, `edit/` (protected), `view/[deckId]/`.
- `lib/` — `auth.ts` (get/set/clear token), `api.ts` (apiUrl, fetchWithAuth with Bearer and 401 → redirect to login).

Edit routes require a token; missing token redirects to `/login?returnUrl=...`. On 403 from the API, the UI shows “No edit access” with links to view or home.

## Docker

- From repo root: `pnpm start` runs the full stack. Frontend at http://localhost:3000, API at http://localhost:3001.

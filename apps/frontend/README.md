# Frontend (Next.js)

Next.js application (App Router) for the Interactive Presentation app. Login and register, edit and view routes; TanStack Query for decks, slides, blocks, and data sources; all data from the Fastify API. JWT stored in localStorage; API client sends `Authorization: Bearer <token>` and redirects to login on 401.

## Setup

- From repo root: `pnpm install`.
- Copy env: create `apps/frontend/.env.local` with:
  - `NEXT_PUBLIC_API_URL` — base URL of the API (e.g. `http://localhost:3000` for local dev, or `http://localhost:3001` when API runs on a different port or in Docker).

## Commands

- **Build:** `nx build frontend` (or `pnpm run build:frontend` from root).
- **Dev server:** `nx serve frontend` (or `pnpm run serve:frontend` from root). Default port 3000.

## Structure

- `app/` — App Router: `layout.tsx`, `page.tsx`, `login/page.tsx`, `register/page.tsx`, `edit/` (protected), `view/[deckId]/`, `dev/chart` (chart test page).
- `components/` — `BarChart.tsx` (Recharts bar chart with custom tooltip), `DataBarChart.tsx` (wires chart to API via TanStack Query).
- `lib/` — `auth.ts` (get/set/clear token), `api.ts` (apiUrl, fetchWithAuth with Bearer and 401 → redirect to login), `queries.ts` (TanStack Query hooks for decks, slides, blocks, data sources).

Edit routes require a token; missing token redirects to `/login?returnUrl=...`. On 403 from the API, the UI shows “No edit access” with links to view or home.

## Chart test page

To test the chart pipeline (bar chart with custom tooltip, wired to API data):

1. Log in and create a deck at `/edit`.
2. Open a deck, upload a CSV via the data sources section.
3. Visit `/dev/chart`.
4. Select the uploaded data source, configure category (X axis) and value (Y axis) columns, and optionally a series column for grouped bars.
5. The chart renders with live API data; hover over bars to see the tooltip with underlying row data.

## Docker

- From repo root: `pnpm start` runs the full stack. Frontend at http://localhost:3000, API at http://localhost:3001.

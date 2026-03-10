# Frontend (Next.js)

Next.js application (App Router) for the Interactive Presentation app. Login and register, edit and view routes; TanStack Query for decks, slides, blocks, and data sources; all data from the Fastify API. JWT stored in localStorage; API client sends `Authorization: Bearer <token>` and redirects to login on 401. Edit deck screen uses a three-panel Flexbox layout: slide list (add/remove/reorder slides), canvas (current slide’s blocks — text and chart, with add/delete/reorder and selection), and properties panel (text block content; chart block chart type (Bar/Line/Pie/Area), data source, and column mapping). Viewer at `view/[deckId]`: full-screen presentation (one slide at a time), next/previous and keyboard (arrows, Space, Escape); read-only slide and chart blocks with tooltips; slide progress; "Edit" link when owner; optional `?token=` for restricted decks.

## Setup

- From repo root: `pnpm install`.
- Copy env: create `apps/frontend/.env.local` with:
  - `NEXT_PUBLIC_API_URL` — base URL of the API (e.g. `http://localhost:3000` for local dev, or `http://localhost:3001` when API runs on a different port or in Docker).

## Commands

- **Build:** `nx build frontend` (or `pnpm run build:frontend` from root).
- **Dev server:** `nx serve frontend` (or `pnpm run serve:frontend` from root). Default port 3000.

## Structure

- `app/` — App Router: `layout.tsx`, `page.tsx`, `login/page.tsx`, `register/page.tsx`, `edit/` (protected; `edit/[deckId]` is the slide editor with three panels), `view/[deckId]/` (full-screen presentation viewer), `dev/chart` (chart test page).
- `components/` — Chart components: `BarChart`, `LineChart`, `PieChart`, `AreaChart` (Recharts with custom tooltips, axis labels, legend) and their `Data*` wrappers (`DataBarChart`, `DataLineChart`, `DataPieChart`, `DataAreaChart`) that wire to API via TanStack Query.
- `lib/` — `auth.ts` (get/set/clear token), `api.ts` (apiUrl, fetchWithAuth with Bearer and 401 → redirect to login), `queries.ts` (TanStack Query hooks for decks, slides, blocks, data sources, including block reorder).

Edit routes require a token; missing token redirects to `/login?returnUrl=...`. On 403 from the API, the UI shows “No edit access” with links to view or home.

## Chart test page

To test the chart pipeline (bar chart with custom tooltip, wired to API data; editor supports Bar, Line, Pie, and Area chart types):

1. Log in and create a deck at `/edit`.
2. Open a deck, upload a CSV via the data sources section.
3. Visit `/dev/chart`.
4. Select the uploaded data source, configure category (X axis) and value (Y axis) columns, and optionally a series column for grouped bars.
5. The chart renders with live API data; hover over bars to see the tooltip with underlying row data.

## Docker

- **Production:** From repo root: `pnpm start` runs the full stack. Frontend at http://localhost:3000, API at http://localhost:3001.
- **Dev mode:** `pnpm dev` from repo root. Frontend runs `next dev` with hot reload; no image rebuild needed on code changes. Database is seeded with sample data (demo credentials: `demo@example.com` / `demo1234`).

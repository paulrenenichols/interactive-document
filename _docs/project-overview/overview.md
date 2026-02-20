# Interactive Presentation App — Project Overview

## Summary

A browser-based application for creating and viewing PowerPoint-like presentations with **interactive charts** driven by CSV (or Excel-exported) data. Users can lay out text and charts on slides, bind each chart to a specific data set, and present with live chart interactions (e.g. hover tooltips that show underlying source data). Access is controlled by **roles and permissions**: edit and view are separate; view can be **public** (anyone with the link) or **restricted** to specific people.

**Stack**: Next.js frontend, Node (Fastify) backend with JWT auth, PostgreSQL via **raw SQL only** (no ORM). Backend serves all data to the frontend; frontend uses **TanStack Query** for server state. The system runs via **Docker Compose** (frontend, API, and database containers).

---

## Scope

### In scope (MVP)

- **Presentations (decks)**  
  Ordered list of slides. Each deck has an owner, **visibility** (public or restricted), and optional **viewer allow-list** or **share tokens**.

- **Slides and layout**  
  Each slide is an ordered list of **blocks**. Blocks can be **text** (title, body, formatting) or **chart**. Users can place and arrange blocks (grid or position/size) to lay out text and charts on each slide.

- **Data sets and charts**  
  Users upload **CSV files** (e.g. from Excel); the backend parses and stores them as named **data sources**. Each **chart block** is associated with **one data set** (one data source). The user maps that data set’s columns to the chart (e.g. category axis, value axis, series). That association is stored and used in both edit and view modes. Charts are built with **Recharts**; **hover tooltips** show data from the underlying source (e.g. full row or configured columns).

- **Edit mode**  
  Route: `edit/[...deckId]`. Requires authentication and **edit permission** for the deck. UI: slide list (e.g. sidebar), canvas for the current slide, **properties panel** for the selected block (text content or chart data source + column mapping). Add/remove/reorder slides and blocks; configure chart type and data binding per chart.

- **View mode**  
  Route: `view/[deckId]`. One slide at a time, full-screen; navigation (next/prev, optional keyboard). Same slide/chart components as edit, read-only; charts remain interactive (e.g. hover tooltips). Access is controlled by **permissions**: public (anyone with link) or restricted (only allowed users/roles).

- **Roles and permissions**  
  - **Edit vs view**: Backend enforces “can edit deck” and “can view deck”. Only users with edit permission can open edit mode and mutate content.  
  - **View visibility**: **Public** — anyone with the view link can open; **Restricted** — only certain users or roles (e.g. allow-list or share token). Backend checks permission before returning deck/slides; 401/403 when not allowed.

- **Tech choices**  
  Next.js (App Router), Fastify, JWT, PostgreSQL, raw SQL (`pg`), TanStack Query, Recharts. No ORM. Docker Compose for frontend, API, and Postgres.

### Out of scope (MVP)

- Real-time collaboration.
- Export to PDF/PPTX.
- Excel binary (`.xlsx`) upload; CSV export from Excel is sufficient for MVP.

---

## Architecture

- **Frontend (Next.js)**  
  All data comes from the Fastify API. TanStack Query handles GET (decks, slides, data sources, rows) and mutations (create/update/delete). Auth: login, store JWT, send `Authorization` header with API requests.

- **Backend (Fastify)**  
  JSON API; JWT auth; **raw SQL** only (`pg`). Routes: auth (register/login, issue JWT), decks CRUD, slides CRUD, data_sources (upload CSV, list, get rows). **Permission checks**: deck read (view) routes enforce view permission (public vs restricted, allow-list/token); edit/mutation routes require JWT and edit permission. Helpers: e.g. `canViewDeck`, `canEditDeck`.

- **Database (PostgreSQL)**  
  Users, decks (owner_id, visibility, optional share_token), deck viewers/allow-list when restricted, slides, blocks (text/chart with layout and config), data_sources, and data rows (or JSONB). Schema and migrations as raw SQL files.

- **Runtime**  
  Docker Compose: `frontend`, `api`, `db`. Frontend uses `NEXT_PUBLIC_API_URL`; API uses `DATABASE_URL`.

---

## Edit vs View (detail)

| Aspect | Edit mode | View mode |
|--------|-----------|-----------|
| Route | `edit/[...deckId]` | `view/[deckId]` |
| Auth | Required; must have edit permission | Optional for public decks; required or token for restricted |
| Layout | Place and arrange text and chart blocks; position/size or grid | One slide at a time, full-screen; no editing |
| Charts | Configure data set and column mapping per chart | Same chart components; read-only; tooltips show source data |
| UI | Slide list, canvas, properties panel | Navigation (next/prev, optional slide list/progress) |

---

## Data model (conceptual)

- **Deck**: id, owner_id, visibility (public \| restricted), optional share_token; optional viewer allow-list or roles when restricted.
- **Slide**: id, deck_id, order; ordered list of blocks.
- **Block**: id, slide_id, type (text \| chart), layout (position/size or grid slot). Text: content, formatting. Chart: **data_source_id** (one data set), chart_type, column_mapping (e.g. category, value, series).
- **Data source**: id, owner/deck context, name; parsed CSV rows stored (e.g. table or JSONB).
- **User**: id, credentials for JWT; used for auth and permission checks.

---

## Implementation order (high level)

1. **Scaffold** — Next.js frontend, Fastify backend, Docker Compose (frontend, api, db). Postgres schema in raw SQL (users, decks, slides, blocks, data_sources, rows).
2. **Auth and permissions** — Fastify register/login, JWT; deck-level visibility and viewer allow-list (or share tokens); `canViewDeck` / `canEditDeck`. Frontend: login UI, token storage, API client with Authorization header.
3. **Data layer** — Fastify: CSV upload (Papa Parse + raw SQL), list sources, get rows; decks/slides CRUD. Frontend: TanStack Query (useQuery/useMutation).
4. **Chart pipeline** — One chart type (e.g. bar) with Recharts; custom Tooltip for underlying data row on hover. Data from TanStack Query.
5. **Slide model + editor** — Create/edit slides and blocks; add chart block and wire to data source + config; persist via Fastify; frontend mutations and query invalidation.
6. **Viewer** — Full-screen slide renderer at `view/[deckId]`; next/prev and keyboard; same chart components with tooltips.
7. **Polish** — Additional chart types, axis/labels, optional export.

---

## Risks and decisions

- **Large CSVs**: Store parsed rows in Postgres (JSONB or normalized); for very large files, consider sampling or pagination when loading into charts.
- **Chart types**: Start with bar and line; add pie/area as needed. Recharts supports these.
- **Permissions**: Implement early (visibility, allow-list or tokens) so view routes can be public or restricted from the start.

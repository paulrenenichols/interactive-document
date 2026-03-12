# Interactive Presentation

Create and view presentations with interactive charts. Monorepo: Next.js frontend and Fastify API, with PostgreSQL.

## Overview

- **Frontend** (`apps/frontend`) — Next.js App Router. Login/register, edit and view routes; TanStack Query for decks, slides, blocks, data sources; Recharts charts (bar, line, pie, area) with custom tooltips and axis labels; JWT stored in localStorage; API client sends `Authorization: Bearer <token>` and redirects to login on 401. Edit deck page: three-panel layout (slide list sidebar, canvas, properties panel); add/remove/reorder slides and blocks; text and chart blocks; chart blocks use chart type (Bar/Line/Pie/Area), data source, and column mapping (category/value/series) persisted per block. Viewer at `view/[deckId]`: full-screen presentation (one slide at a time), next/previous and keyboard (arrows, Space, Escape); read-only slide and chart rendering with tooltips; optional share token in URL for restricted decks. Dev chart test page at `/dev/chart` for testing the chart pipeline with live data.
- **API** (`apps/api`) — Fastify JSON API. Auth (register, login, JWT), decks/slides/blocks CRUD, data sources with CSV upload, permissions (`canEditDeck`, `canViewDeck`). PostgreSQL with raw SQL.

## How to run

### Local (no Docker)

1. **Install:** `pnpm install`
2. **Database:** Start PostgreSQL (e.g. local install or Docker only for db). Create DB and run migrations:
   - `DATABASE_URL=postgres://user:pass@localhost:5432/interactive_document pnpm run migrate`
3. **API:** In `apps/api` create `.env` with `DATABASE_URL`, `JWT_SECRET`, and optional `PORT`. From root: `pnpm run serve:api` (default port 3000).
4. **Frontend:** In `apps/frontend` create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3000`. From root: `pnpm run serve:frontend` (default port 3000; may conflict with API — use different port or run API on another port).

### Docker (production build)

- **Start stack:** `pnpm start` (or `docker compose up -d`). Frontend: http://localhost:3000, API: http://localhost:3001.
- **Stop:** `pnpm stop` (or `docker compose down`).

Set `JWT_SECRET` for the API (e.g. in `docker-compose.yml` or env file) for auth to work.

### Docker (dev mode with live reload)

Run the full stack in Docker with live reload — code changes apply without rebuilding images.

```sh
pnpm dev
```

This starts:
- **Frontend:** http://localhost:3000 (Next.js dev server with hot reload)
- **API:** http://localhost:3001 (tsx watch mode)
- **DB UI:** http://localhost:8080 (Adminer — browse Postgres, run queries)
- **Database:** PostgreSQL with migrations and seed data

**Demo credentials:** `demo@example.com` / `demo1234`

The dev stack automatically seeds the database with sample users, decks, slides, and data sources.

## Links

- [API README](apps/api/README.md) — setup, routes, migrations
- [Frontend README](apps/frontend/README.md) — setup, run, structure
- **API Docs:** http://localhost:3001/docs (Swagger UI, available when running)
- **Storybook:** `pnpm storybook` — component development at http://localhost:6006

## Docs-driven development

This project uses the **docs-driven-dev** system for planning, milestones, and documentation.

- **Structure:** See [_docs/](_docs/) for the docs layout — planning, milestones (completed/active/future), progress, and explorations.
- **Skill:** The docs-driven-dev skill is embedded in `.cursor/skills/docs-driven-dev/`; no install needed. Collaborators get it when they clone the repo.

### How to use the skill

1. **Open Cursor Agent chat** — The skill is loaded automatically when this project is open.
2. **See what it can do** — Ask **"help"** or **"what can you do?"** for a full list of capabilities.
3. **Run a workflow** — Use plain language; both "docs" and "_docs" work. Examples:
   - *"Upgrade docs"* / *"upgrade _docs"* — Update this project's _docs to the latest skill version and structure.
   - *"Create exploration"* — Start a new exploration under _docs/planning/explorations/.
   - *"Update exploration (name)"* — Update an existing exploration (e.g. add feature sets).
   - *"Turn exploration X into a milestone"* — Evaluate an exploration and create a milestone in milestones/future/.
   - *"Make milestone (name) active"* — Move a future milestone to active and run an accuracy pass.
   - *"Mark milestone (name) completed"* — Move an active milestone to completed and assign a number prefix.
   - *"Convert to docs"* / *"add docs to this project"* — Add _docs to a project that doesn't have it yet (infer from codebase).
   - *"Setup docs"* / *"scaffold _docs"* — Create _docs in an empty folder (new project).

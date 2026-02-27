# Phase: Scaffold (01-setup)

Scope and goals for the initial setup phase. Delivers a barebones runnable structure: Nx workspace, frontend and API apps, Docker Compose, and Postgres schema.

---

## Scope

- Create Nx workspace at repo root with minimal config.
- Add Next.js app (e.g. `apps/frontend`) using App Router; placeholder landing route.
- Add Fastify app (e.g. `apps/api`) with a health or root route returning JSON.
- Add Docker Compose with three services: `frontend`, `api`, `db` (PostgreSQL). Frontend uses `NEXT_PUBLIC_API_URL` pointing at the API; API uses `DATABASE_URL` pointing at the database.
- Define Postgres schema in raw SQL (migrations): users, decks, slides, blocks, data_sources, and a structure for data rows (e.g. table or JSONB). No application logic beyond "workspace runs and DB is created."

---

## Goals

- `nx build frontend` and `nx build api` succeed.
- `docker compose up` brings up frontend, api, and db; frontend is reachable in the browser; API health returns 200; DB accepts connections.
- Migrations run (manually or on api startup) and create the initial schema so later phases can implement auth and data layer against it.

---

## Out of scope

- Authentication, permissions, or real app routes.
- CSV upload, charts, or slide editor UI.
- Any feature beyond "run the stack and have a DB."

This phase produces the foundation for [02-mvp](../02-mvp) phases (auth, data layer, chart pipeline, slide editor, viewer).

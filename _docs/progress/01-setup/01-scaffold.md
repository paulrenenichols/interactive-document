# Progress: 01-setup / 01-scaffold

Summary of work done on branch `01-setup/01-scaffold` (from commits).

## Deliverables

- **Nx workspace:** Initial Nx workspace and config; build/serve targets for apps.
- **Next.js frontend:** App under `apps/frontend` with App Router, minimal `app/page.tsx` and `app/layout.tsx`, `NEXT_PUBLIC_API_URL` env.
- **Fastify API:** App under `apps/api` with health route, `DATABASE_URL` env.
- **Docker Compose:** `docker-compose.yml` with services `frontend`, `api`, `db` (PostgreSQL); volume for DB; migrations and startup ordering.
- **Postgres schema:** Migrations folder with number-prefixed SQL; initial migration for `users`, `decks`, `slides`, `blocks`, `data_sources`, `data_rows` (or equivalent).
- **READMEs:** Project root and per-app READMEs added/updated.

## Key commits

- chore: add Nx workspace and config
- feat(setup): add Next.js frontend app with App Router
- feat(setup): add Fastify API app with health route
- feat(setup): add Docker Compose for frontend, api, db
- feat(setup): add Postgres schema and initial migration
- chore(01-setup): complete scaffold phase
- fix(frontend): correct standalone server.js path and static/public paths in Dockerfile
- chore: add start/stop scripts, migrate to pnpm, update Docker and docs

## Phase plan

See [_docs/milestones/01-setup/phase-plans/01-scaffold.md](../../milestones/01-setup/phase-plans/01-scaffold.md).

# Progress: Dev stack (developer-experience)

Phase 1 of the developer-experience milestone.

## Deliverables

- **docker-compose.dev.yml** — Dev override that mounts source code and runs dev servers in containers:
  - API: `tsx watch` for live TypeScript compilation
  - Frontend: `next dev` with hot reload
  - Adminer: DB UI at http://localhost:8080

- **dev/Dockerfile** — Single dev image with all dependencies; source mounted at runtime

- **pnpm dev script** — `pnpm dev` starts the full dev stack with `--build`

- **Seed data** — `RUN_SEED=true` env (dev only) runs `scripts/seed.mjs` after migrations:
  - Demo user: `demo@example.com` / `demo1234`
  - Sample deck with 3 slides
  - Data source with monthly sales data
  - Text and chart blocks

- **tsx** — Added as dev dependency for API watch mode

## Key changes

| File | Change |
|------|--------|
| `docker-compose.dev.yml` | New: dev overrides with source mounts, Adminer |
| `dev/Dockerfile` | New: dev base image |
| `scripts/seed.mjs` | New: idempotent seed script |
| `scripts/run-migrations.mjs` | Updated: run seed when RUN_SEED=true |
| `package.json` | Added `dev` script, tsx dependency |
| `README.md` | Added dev mode instructions |
| `apps/api/README.md` | Added dev mode note |
| `apps/frontend/README.md` | Added dev mode note |

## Phase plan

See [`_docs/milestones/active/developer-experience/phase-plans/01-dev-stack.md`](../../milestones/active/developer-experience/phase-plans/01-dev-stack.md)

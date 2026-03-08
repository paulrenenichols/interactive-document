# Watch dev Docker + package.json script

## Summary

Add a **separate** `docker-compose.dev.yml` and a single package.json script so developers can run the full stack in Docker with live reload—no image rebuild on code changes.

## Scope

- **docker-compose.dev.yml** — Dedicated dev Compose file (not a profile) that overrides/extends the base `docker-compose.yml`:
  - Mount repo source (and optionally `node_modules`) so api and frontend see code changes.
  - Run dev servers inside containers: `tsx watch` for api, `next dev` for frontend (per existing `project.json` dev configurations).
  - Keep db and migrations as-is (migrations run once at startup).
- **Package.json script** — e.g. `pnpm dev` or `pnpm dev:docker` that runs:
  - `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`
  so one command starts the full dev stack with watch.

Prod `docker-compose.yml` stays unchanged so you can run prod Compose locally to test a "prod" build without dev tooling.

## Dependencies

- Current [docker-compose.yml](../../../../docker-compose.yml) (db, migrations, api, frontend).
- API dev: `tsx watch apps/api/src/main.ts` ([apps/api/project.json](../../../../apps/api/project.json)).
- Frontend dev: `next dev` ([apps/frontend/project.json](../../../../apps/frontend/project.json)).
- Monorepo: pnpm workspace, Nx; dev containers need repo root (or apps + root config) mounted.

## Risks / mitigations

- **Volume mount performance (macOS/Windows):** Use delegated/cached volumes; document "for fastest DX use host-run api/frontend + Docker DB only" if needed.
- **Env parity:** Dev Compose reuses same env vars as prod (e.g. `DATABASE_URL`, `NEXT_PUBLIC_API_URL`).

## Out of scope

- CI changes; production Docker or Dockerfile changes.

# Phase: Dev stack (developer-experience)

Dev Docker with live reload, DB UI, and optional seed data so the full stack runs in Docker with fast feedback and real-looking data.

---

## Scope

- **docker-compose.dev.yml** — Separate dev Compose file; mount repo source; run dev servers in containers (`tsx watch` for API, `next dev` for frontend). Single script (e.g. `pnpm dev` or `pnpm dev:docker`) to start full stack with watch.
- **DB UI** — Lightweight DB UI (e.g. Adminer) in dev Compose only; one URL to browse Postgres and run queries.
- **Seed data** — Optional seed (env-driven, dev only): e.g. `RUN_SEED=true` in dev Compose; after migrations, insert sample users, decks, slides, data sources. Prod Compose stays unseeded.

---

## Goals

- One command starts the full dev stack in Docker with live reload (no image rebuild on code changes).
- Developers can browse the DB and run queries from the browser in dev.
- "Start app → see real-looking data" in dev without manual setup.

---

## Out of scope

- CI or production Docker changes.
- Production DB access or seed in prod.

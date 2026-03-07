# Seed data (dev only)

## Summary

Add optional seed data so “start app → see real-looking data” in dev without manual setup. Triggered by an env variable on the **migrations service in dev only**; prod Compose does not set it, so you can run prod locally and get a clean, unseeded DB.

## Scope

- **Env variable** — Add an env var (e.g. `RUN_SEED=true` or `SEED_DEV=true`) that the migrations service (or a post-migration step) reads.
- **When set (dev only):** After migrations complete, run a seed step that inserts sample users, decks, slides, data sources (and any other data needed for a realistic demo).
- **Where set:** Only in the dev Compose setup (e.g. in `docker-compose.dev.yml` or env file used for dev). **Not** set in `docker-compose.yml`, so `docker compose up` (prod-style) keeps an unseeded DB for testing “prod” locally.

## Implementation notes

- Seed can be a Node script (e.g. `scripts/seed-dev.mjs`) or SQL file run after migrations; migrations service command can branch on the env var.
- Keep seed idempotent or document that it’s for fresh dev DBs.

## Out of scope

- Seed in production or in prod Compose.

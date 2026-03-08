# DB UI (dev only)

## Summary

Add a lightweight database UI service to the **dev** Compose setup so developers can browse Postgres (tables, run queries) from the browser without a separate install.

## Scope

- Add one service (e.g. **Adminer** or similar) to the dev Compose file only (`docker-compose.dev.yml`).
- Expose a single URL (e.g. port 8080 or 8081) to log in to the same Postgres instance used by the app (`DATABASE_URL` / db service).
- Not included in prod `docker-compose.yml`; no production impact.

## Out of scope

- Production DB access; this is dev-only.

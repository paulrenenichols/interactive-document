# Phase: API docs (developer-experience)

Live API documentation and configurable API log level for local dev and staging.

---

## Scope

- **Live API docs** — OpenAPI/Swagger (or similar) tied to the running Fastify API; routes, request/response shapes, optional auth (Bearer JWT). Accessible in local dev and staging (e.g. `/docs` or `/api-docs`). Prefer schema-driven so docs stay in sync with the app.
- **API log level** — Env variable (e.g. `LOG_LEVEL=debug`). API reads it at startup; dev uses verbose logging, prod uses `info` or `warn`.

---

## Goals

- Frontend devs and integrators can discover and call the API from the docs without reading source.
- Dev can run with debug logs; prod stays quieter.

---

## Out of scope

- Public production API docs (unless added later).
- Frontend logging (API-only for this phase).

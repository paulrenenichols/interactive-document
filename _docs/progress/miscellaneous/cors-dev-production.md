# Progress: miscellaneous / cors-dev-production

Summary of work done for env-driven CORS (local dev vs production).

## Deliverables

- **Env-driven CORS in API:** `apps/api/src/main.ts` reads `CORS_ORIGINS`; when set, uses comma-separated allow-list; when unset (local dev), uses `origin: true`. Both paths use explicit `methods` (GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS) and `allowedHeaders` (Content-Type, Authorization, Accept, Accept-Language) so preflights for slide reorder and other mutations succeed.
- **Production safeguard:** If `NODE_ENV === 'production'` and `CORS_ORIGINS` is unset, the API logs a warning and exits so production never runs with permissive CORS.
- **Documentation:** `.env.example` and API README document `CORS_ORIGINS`. Update definition in `_docs/updates/cors-dev-production.md`.

## Note

This work is not tied to a milestone/phase; it is tracked under `_docs/progress/miscellaneous/`.

# CORS: Local dev vs production

- Implement env-driven CORS in the API so local dev works (including slide reorder and other PATCH + Authorization flows) and production uses an explicit allow-list.

- **Scope:**
  - **apps/api/src/main.ts:** Read `CORS_ORIGINS` from env. When set (e.g. in production), use it as a comma-separated allow-list for `origin`. When unset (local dev), use `origin: true`. In both cases use explicit `methods` (GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS) and `allowedHeaders` (Content-Type, Authorization, Accept, Accept-Language) so preflights for PATCH + Authorization succeed (e.g. slide reorder). Optional: if `NODE_ENV === 'production'` and `CORS_ORIGINS` is unset, log a warning and exit so production never runs with permissive CORS.
  - **apps/api/.env.example:** Add a commented `CORS_ORIGINS` line with an example for production and a note that leaving it unset is fine for local dev.
  - **apps/api/README.md:** Document that production should set `CORS_ORIGINS` to a comma-separated list of allowed frontend origins.

- **Why methods/headers:** CORS issues were seen when testing moving slides. Reorder uses PATCH with Authorization and Content-Type; the browser sends a preflight (OPTIONS). The server must respond with Access-Control-Allow-Methods (including PATCH) and Access-Control-Allow-Headers (including Authorization, Content-Type). Relying only on `origin: true` can leave methods/headers to plugin defaults, which may not match the frontend—so the config must set explicit methods and allowedHeaders.

- When work is complete, add a progress note under `_docs/progress/miscellaneous/cors-dev-production.md` (short summary, deliverables, note that it’s tracked under miscellaneous).

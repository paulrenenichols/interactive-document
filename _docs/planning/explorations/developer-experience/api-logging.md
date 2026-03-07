# API logging level (env variable)

## Summary

Control API log verbosity (including debug logs) via an **environment variable** (e.g. `LOG_LEVEL=debug`). Dev can run with more verbose logging; prod can use a quieter level.

## Scope

- **Env variable** — e.g. `LOG_LEVEL` with values such as `error`, `warn`, `info`, `debug`. API reads it at startup and logs at that level (and above).
- **Where set:** Dev Compose / dev env: e.g. `LOG_LEVEL=debug`. Prod Compose / prod env: e.g. `LOG_LEVEL=info` or `warn`.
- Implement in the Fastify API: use a small logger (or Fastify’s logger) that respects the level; ensure request/error logging is consistent.

## Out of scope

- Frontend logging (can be added later if needed); this is API-only.

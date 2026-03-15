# Progress: API docs (developer-experience)

Phase 2 of the developer-experience milestone.

## Deliverables

- **LOG_LEVEL env** — Configurable log verbosity via environment variable:
  - Levels: `error`, `warn`, `info` (default), `debug`
  - Fastify logger respects the level
  - Set in docker-compose.yml (default: info)

- **OpenAPI/Swagger docs** — Live API documentation at `/docs`:
  - @fastify/swagger generates OpenAPI spec from routes
  - @fastify/swagger-ui provides interactive UI
  - Includes JWT bearer auth scheme
  - Available in dev and staging (http://localhost:3001/docs)

## Key changes

| File | Change |
|------|--------|
| `apps/api/src/main.ts` | Added LOG_LEVEL env, Swagger registration |
| `docker-compose.yml` | Added LOG_LEVEL env to api service |
| `package.json` | Added @fastify/swagger, @fastify/swagger-ui |
| `apps/api/README.md` | Added LOG_LEVEL docs, API Documentation section |
| `README.md` | Added API Docs link |

## Phase plan

See [`_docs/milestones/active/developer-experience/phase-plans/02-api-docs.md`](../../milestones/active/developer-experience/phase-plans/02-api-docs.md)

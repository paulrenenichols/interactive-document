# Live API documentation (dev and staging)

## Summary

Add live API documentation that developers and stakeholders can open in **local dev** and **staging**. Docs should reflect the current API (routes, request/response shapes) so they stay accurate as the API changes.

## Scope

- **Live** — Generated from or tied to the running Fastify API (e.g. OpenAPI/Swagger from route definitions, or a docs endpoint that reflects registered routes).
- **Accessible in:** Local development (e.g. when running via `pnpm dev` or dev Docker) and staging. Not necessarily exposed in production, or only behind auth/feature flag if desired.
- **Content:** API base URL, list of routes, HTTP methods, request bodies, response shapes, and optionally auth (e.g. Bearer JWT). Enough for frontend devs and integrators to call the API without reading source.

## Implementation options

- **OpenAPI (Swagger):** Fastify plugin (e.g. `@fastify/swagger` + `@fastify/swagger-ui`) to expose a spec and a UI at e.g. `/docs` or `/api-docs`. Register schemas/routes so the spec stays in sync.
- **Alternative:** Static OpenAPI/Swagger file maintained by hand or generated at build time; less "live" but simpler. Prefer live/schema-driven so dev and staging always match the running app.

## Out of scope

- Public production API docs (unless explicitly added later); this is for dev and staging.

# Phase plan: API docs (developer-experience)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `developer-experience/02-api-docs`.

---

## 2. API log level (env)

- Add `LOG_LEVEL` env (e.g. `error`, `warn`, `info`, `debug`). API reads at startup; use Fastify logger or small logger that respects level. Set `LOG_LEVEL=debug` in dev Compose, `info` or `warn` in prod.
- **Checkpoint:** Add, commit, and push (e.g. "feat(api): configurable log level via LOG_LEVEL env").

---

## 3. Live API documentation

- Add Fastify OpenAPI/Swagger (e.g. `@fastify/swagger` + `@fastify/swagger-ui`); expose spec and UI at e.g. `/docs` or `/api-docs`. Register schemas/routes so spec stays in sync. Accessible in local dev and staging.
- **Checkpoint:** Add, commit, and push (e.g. "feat(api): live OpenAPI/Swagger docs for dev and staging").

---

## 4. READMEs (on phase completion)

- Add or update project and app READMEs to mention API docs URL and LOG_LEVEL where relevant.
- **Checkpoint:** Add, commit, and push (e.g. "docs: READMEs for API docs and logging").

---

## 5. Progress documentation

- Add or update `_docs/progress/future/developer-experience/02-api-docs.md` with a short summary of work done. Optionally link to this phase plan.

---

## 6. Final step (on user approval)

- When the user confirms the phase is complete: final pass on progress doc. Add any remaining changes, commit, and push (e.g. "chore(developer-experience): complete 02-api-docs phase"), including the progress doc.

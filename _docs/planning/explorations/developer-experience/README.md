# Developer experience

This exploration collects ideas to improve **local development** for this project: faster feedback (e.g. live reload in Docker), better tooling (API docs, DB UI, Storybook), and clearer process (rules and skills for the agent).

The docs below describe each feature set. Use [explorations-evaluation.md](../../setup/explorations-evaluation.md) to evaluate this exploration or turn it into a milestone.

---

## Feature docs

| Doc | Summary |
|-----|--------|
| [overview.md](overview.md) | Why we're exploring dev-ex improvements; parallel dev Docker with live rebuild, plus other ideas from the current project state. |
| [docker-compose-dev.md](docker-compose-dev.md) | Separate `docker-compose.dev.yml` and a single script so the full stack runs in Docker with live reload (no image rebuild on code changes). |
| [db-ui.md](db-ui.md) | Lightweight DB UI (e.g. Adminer) in dev Compose only so developers can browse Postgres and run queries from the browser. |
| [seed-data.md](seed-data.md) | Optional seed data in dev (env-driven, dev Compose only) so "start app → see real-looking data" without manual setup. |
| [api-docs.md](api-docs.md) | Live API documentation (OpenAPI/Swagger or similar) for local dev and staging so routes and request/response shapes stay accurate. |
| [api-logging.md](api-logging.md) | API log level controlled by env (e.g. `LOG_LEVEL=debug` in dev, `info` in prod) for clearer debugging. |
| [storybook.md](storybook.md) | Storybook for the frontend app so editor, viewer, charts, and auth components can be developed and reviewed in isolation. |
| [rules-and-skills.md](rules-and-skills.md) | Extract _docs processes (phase execution, exploration evaluation, milestone creation, code conventions) into Cursor rules and skills. |

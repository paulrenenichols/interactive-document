# Developer experience

Updated with the **docs-driven-dev** skill (v1.2.0). (Previously: v1.0.0)

This exploration collects ideas to improve **local development** for this project: faster feedback (e.g. live reload in Docker), better tooling (API docs, DB UI, Storybook), and clearer process (rules and skills for the agent).

Use [exploration-lifecycle.md](../../../setup/exploration-lifecycle.md) to evaluate this exploration or turn it into a milestone.

**Milestone:** This exploration was turned into the [developer-experience](../../../../milestones/active/developer-experience/) milestone (active).

Feature sets are in `feature-sets/` (see [feature-sets/README.md](feature-sets/README.md)). Supporting materials (screenshots, extra docs) are in [supporting-docs/](supporting-docs/) with a short index in [supporting-docs/README.md](supporting-docs/README.md).

---

## Watch dev Docker + package.json script

Separate `docker-compose.dev.yml` and a single script so the full stack runs in Docker with live reload (no image rebuild on code changes).

See [docker-compose-dev.md](feature-sets/docker-compose-dev.md) for details.

## DB UI (dev only)

Lightweight DB UI (e.g. Adminer) in dev Compose only so developers can browse Postgres and run queries from the browser.

See [db-ui.md](feature-sets/db-ui.md) for details.

## Seed data (dev only)

Optional seed data in dev (env-driven, dev Compose only) so "start app → see real-looking data" without manual setup.

See [seed-data.md](feature-sets/seed-data.md) for details.

## Live API documentation (dev and staging)

Live API documentation (OpenAPI/Swagger or similar) for local dev and staging so routes and request/response shapes stay accurate.

See [api-docs.md](feature-sets/api-docs.md) for details.

## API logging level (env variable)

API log level controlled by env (e.g. `LOG_LEVEL=debug` in dev, `info` in prod) for clearer debugging.

See [api-logging.md](feature-sets/api-logging.md) for details.

## Storybook

Storybook for the frontend app so editor, viewer, charts, and auth components can be developed and reviewed in isolation.

See [storybook.md](feature-sets/storybook.md) for details.

## Rules and skills

Extract _docs processes (phase execution, exploration evaluation, milestone creation, code conventions) into Cursor rules and skills.

See [rules-and-skills.md](feature-sets/rules-and-skills.md) for details.

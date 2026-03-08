# Feature sets — Developer experience

For overview and structure, see [../README.md](../README.md).

## Watch dev Docker + package.json script

Separate `docker-compose.dev.yml` and a single script so the full stack runs in Docker with live reload (no image rebuild on code changes).

See [docker-compose-dev.md](docker-compose-dev.md).

## DB UI (dev only)

Lightweight DB UI (e.g. Adminer) in dev Compose only so developers can browse Postgres and run queries from the browser.

See [db-ui.md](db-ui.md).

## Seed data (dev only)

Optional seed data in dev (env-driven, dev Compose only) so "start app → see real-looking data" without manual setup.

See [seed-data.md](seed-data.md).

## Live API documentation (dev and staging)

Live API documentation (OpenAPI/Swagger or similar) for local dev and staging so routes and request/response shapes stay accurate.

See [api-docs.md](api-docs.md).

## API logging level (env variable)

API log level controlled by env (e.g. `LOG_LEVEL=debug` in dev, `info` in prod) for clearer debugging.

See [api-logging.md](api-logging.md).

## Storybook

Storybook for the frontend app so editor, viewer, charts, and auth components can be developed and reviewed in isolation.

See [storybook.md](storybook.md).

## Rules and skills

Extract _docs processes (phase execution, exploration evaluation, milestone creation, code conventions) into Cursor rules and skills.

See [rules-and-skills.md](rules-and-skills.md).

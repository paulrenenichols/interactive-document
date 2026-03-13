# Unit testing (Vitest)

Updated with the **docs-driven-dev** skill (v1.2.0).

## Summary

Introduce unit tests for the API (Fastify), the frontend app (Next.js), and the new Material UI library (`libs/material-ui`) using **Vitest** as the single test runner. One runner across all three keeps feedback fast and configuration consistent.

## Tool choice

**Vitest** — ESM-native, fast, with good Nx support via `@nx/vitest:configuration`. Works for Node (API) and DOM/React (frontend, material-ui). Use React Testing Library where component tests are needed. See [Nx Vitest docs](https://nx.dev/technologies/test-tools/vitest) for project configuration and `vitest.config.ts`.

## Scope per area

- **API:** Unit test handlers, auth/validation helpers, and service logic. Integration or e2e tests are out of scope for this feature set.
- **Frontend:** Unit test hooks, utils, and small components. Use React Testing Library for component tests.
- **Material UI library:** Unit test components in isolation (props, accessibility, key interactions). Storybook remains the primary place for visual documentation; Vitest covers behavior and edge cases.

## Nx integration

- Add a **test** target to each project (api, frontend, material-ui) using Vitest. Use the Nx generator: `nx g @nx/vitest:configuration --project=<project-name>` (or equivalent for the workspace).
- The material-ui library gets its test target when the library is created (per [material-design-component-library.md](material-design-component-library.md)).

## Root package.json scripts

Add a **`test`** script at the repo root (e.g. `nx run-many -t test`) so CI and developers can run all tests in one command.

## Dependencies

- None — this can be implemented early. The material-ui test target is added when that library exists.

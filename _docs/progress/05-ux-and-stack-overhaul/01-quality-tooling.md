# Progress: 01-quality-tooling (ux-and-stack-overhaul)

## Summary

Phase 01 sets up baseline quality tooling: ESLint (including React/JSX rules), Vitest test runs, and CI/PR gates with Storybook deploy.

## Linting

- Added flat-config ESLint at `eslint.config.mjs` using `@eslint/js` + `typescript-eslint`.
- Enabled React linting for `apps/frontend/**/*.ts(x)` via `eslint-plugin-react` wrapped with `@eslint/compat` (`fixupPluginRules`), including the recommended rule set.
- Configured Nx lint targets for `api` and `frontend` (`@nx/eslint:lint`) and a root `pnpm lint` script (`nx run-many -t lint`).
- Cleaned up existing lint errors so the workspace passes `pnpm lint`.

## Testing

- Added Vitest for both `apps/api` and `apps/frontend` with:
  - `apps/api/vitest.config.ts` (Node environment) and a basic sanity test.
  - `apps/frontend/vitest.config.ts` (jsdom + `@vitejs/plugin-react`) and `vitest.setup.ts` wiring `@testing-library/jest-dom/vitest`.
- Added Nx `test` targets for `api` and `frontend` plus a root `pnpm test` script (`nx run-many -t test --projects=api,frontend`).

## CI and Storybook

- Created `.github/workflows/ci.yml`:
  - On PRs and pushes to `main`, runs `pnpm lint`, `pnpm test`, and `pnpm build`.
  - On pushes to `main`, runs `nx run frontend:build-storybook` and deploys Storybook to GitHub Pages via `actions/deploy-pages`.
- Updated root and app READMEs with lint/test/CI commands and Storybook guidance.


# Phase: Quality tooling (ux-and-stack-overhaul)

ESLint, Vitest, and GitHub Actions CI/PR gates so the workspace has lint, test, and required checks before merge. Foundation for all later phases.

---

## Scope

- **ESLint** — Lint target for api, frontend, and (when it exists) material-ui; TypeScript- and React-aware rules; root `lint` script.
- **Vitest** — Unit tests for api, frontend, and material-ui; root `test` script; React Testing Library where needed.
- **CI and PR gates** — GitHub Actions: lint, test, build on PR and push to main; build and deploy Storybook to GitHub Pages; branch protection so checks block merge.

---

## Goals

- One command to lint and test the whole workspace.
- PRs cannot merge until lint, test, and build pass.
- Storybook (frontend and later material-ui) deploys to GitHub Pages from main.

---

## References

- Exploration: [lint-eslint](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/lint-eslint.md), [unit-testing-vitest](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/unit-testing-vitest.md), [ci-and-pr-gates](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/ci-and-pr-gates.md).

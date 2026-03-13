# Lint (ESLint)

Updated with the **docs-driven-dev** skill (v1.2.0).

## Summary

Add ESLint to the workspace so the API, frontend, and (later) the material-ui library can be linted. Provides a single, scriptable lint step for CI and local use.

## Current state

- No ESLint configuration exists in the repo. No lint targets on `api` or `frontend`. No `lint` script in root `package.json`.

## Scope

- Introduce ESLint (e.g. via Nx ESLint config or workspace rules). Add a **lint** target to each project: `api`, `frontend`, and `material-ui` (when the library exists).
- Use TypeScript-aware rules. For frontend and material-ui, add React-specific rules and optionally an accessibility plugin (e.g. `eslint-plugin-jsx-a11y`).
- **Root package.json scripts:** Add a **`lint`** script at the repo root (e.g. `nx run-many -t lint` or `nx run-many -t lint --all`). This is what CI and developers run.

## Dependencies

- None — this can be implemented early. The material-ui library gets a lint target when it is created (per [material-design-component-library.md](material-design-component-library.md)).

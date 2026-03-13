# CI and PR gates (GitHub Actions)

Updated with the **docs-driven-dev** skill (v1.2.0).

## Summary

GitHub Actions that run **lint**, **test**, and **build** for the API, frontend, and (when it exists) the material-ui library. Also **build and deploy Storybook** (frontend and material-ui) to GitHub Pages. Failed checks must block merging PRs into `main`. This feature set explicitly covers **branch protection and other GitHub repo settings** so required status checks and deploy work; it also instructs implementers to **review existing main restrictions** and recommend updates as needed.

## Workflow(s)

- **Trigger:** On pull requests targeting `main`, and on push to `main` (for post-merge verification and for Storybook deploy).
- **Lint / test / build:** Run root `pnpm run lint`, `pnpm run test`, and build (e.g. `nx run-many -t build`) for `api`, `frontend`, and `material-ui` (include material-ui once the library exists). Use pnpm; cache the pnpm store and Nx cache to speed runs. A single workflow file under `.github/workflows/` is sufficient unless you later split (e.g. separate deploy workflow).
- **Storybook build and deploy to GitHub Pages:** Build Storybook for the frontend (existing `build-storybook` target) and for the material-ui library (when it exists). Deploy the built Storybook output to GitHub Pages (e.g. `peaceiris/actions-gh-pages` or `actions/upload-pages-artifact` + `actions/deploy-pages`). Prefer a **single Pages site with subpaths** (e.g. `/` for frontend Storybook, `/material-ui` for the library Storybook) rather than separate deployments. Trigger the deploy on push to `main` (and optionally on release). Document that GitHub Pages must be enabled in the repo (Settings → Pages → source: GitHub Actions or gh-pages branch, depending on the chosen approach).

## Branch protection and GitHub configuration

- **Required status checks:** Configure branch protection for `main` so that the CI workflow’s status check(s) must pass before merging. Document the exact check name(s) that must be required (e.g. the workflow name or job id) so repo admins can set the rule correctly.
- **Review existing main restrictions:** The repo already has some restrictions on `main`. Document that implementers should **review** the current branch protection rules (and any other relevant repo settings) and **update them if needed** so that: (1) the new lint/test/build checks are required before merge, (2) Storybook deploy can run (e.g. from `main` or a release), and (3) no conflicting rules block PRs or deployments. List what to check: required status checks, required pull request reviews, restrict who can push to main, linear history, etc. The doc should say “review and update if needed” so existing restrictions are respected but aligned with the new CI and deploy.

## Dependencies

- Depends on [lint-eslint.md](lint-eslint.md) (lint targets and root `lint` script) and [unit-testing-vitest.md](unit-testing-vitest.md) (test targets and root `test` script). The material-ui library is included in the workflows once it exists.

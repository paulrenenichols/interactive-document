# Exploration: ci-scope-optimization

**Purpose:** Optimize CI scope so we only run expensive checks (lint, test, build) when code is actually impacted, while allowing docs-only and planning-only changes (like new explorations) to merge quickly.

## Goals

- Reduce unnecessary CI time for `_docs/`-only and similar changes.
- Use `nx affected` as the primary mechanism for deciding *what* to run on code changes.
- Keep the rules simple and explainable for contributors.
- Minimize risk of merging broken code due to over-aggressive skipping.

## Non-goals

- Replacing Nx as the core orchestration tool.
- Fully solving flakiness or performance issues unrelated to CI scope.
- Designing an approval policy; this is purely about *what work CI runs*.

## Approach (high level)

- Add a **docs-only guard** early in CI:
  - If all changed files are in clearly non-code paths (e.g. `_docs/**`, `docs/**`, `*.md` in certain locations), we skip heavy Nx tasks entirely.
  - Otherwise, we proceed with normal CI.

- For non-docs-only changes, run **`nx affected`** for:
  - `lint`
  - `test`
  - `build`
  using the project graph to scope work to only affected projects.

## Feature sets

- `docs-only-guard`: detect when a PR changes only documentation / planning files and skip heavy CI steps.
- `nx-affected-ci`: use `nx affected` to drive lint/test/build for code changes.
- `workflow-clarity`: document the behavior so contributors understand why their PR did or didn’t run full CI.

## Supporting docs

- `supporting-docs/ci-scope-design.md`: design, options, and tradeoffs for the CI scope rules.
- (Add more docs as we iterate.)

## Status

- Created with the **docs-driven-dev** skill (v2.0.0).  
- Evaluated and converted into the **CI scope optimization** milestone (completed as `07-ci-scope-optimization`).

---

Use `_docs/planning/explorations/completed/07-ci-scope-optimization/feature-sets/` for per–feature-set markdown and `supporting-docs/` for design and research artifacts.


# Phase 2: Nx affected CI

## Scope

Use `nx affected` as the primary mechanism for deciding what to run on non-docs-only changes in CI, with sensible base/head configuration and parallelism.

## Changes in this phase

- **Chunk 1: Base Nx affected wiring**
  - CI now runs `nx affected -t lint`, `nx affected -t test`, and `nx affected -t build` in the main `CI (nx affected)` job whenever the docs-only guard reports `docs_only = false`.
- **Chunk 2: Base/head and parallelism**
  - Base/head are configured as `--base=origin/main --head=HEAD`, matching the intended `origin/main...HEAD` comparison.
  - Added `--parallel=3` to Nx affected commands to balance speed and load in CI.
- **Chunk 3: Safety and validation**
  - See `phase-2-validation-notes.md` in this folder for assumptions about the Nx project graph and guidance on how to react if affected sets look surprising.

## Notes

- Work for this phase happens on the `docs/ci-scope-optimization-phase-2` branch.
- See `_docs/milestones/active/ci-scope-optimization/phase-plans/phase-2-nx-affected-ci.md` for the full phase plan.


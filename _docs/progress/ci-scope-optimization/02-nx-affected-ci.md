# Phase 2: Nx affected CI

## Scope

Use `nx affected` as the primary mechanism for deciding what to run on non-docs-only changes in CI, with sensible base/head configuration and parallelism.

## Planned chunks

1. **Chunk 1: Base Nx affected wiring**
   - Add CI steps that run `nx affected -t lint`, `nx affected -t test`, and `nx affected -t build` when the docs-only guard reports `docs_only = false`.
2. **Chunk 2: Base/head and parallelism**
   - Confirm base/head strategy (default `origin/main...HEAD`) and tune `--parallel` / `--maxParallel` and optional `--configuration=ci` for this repo.
3. **Chunk 3: Safety and validation**
   - Document assumptions about the Nx project graph, and outline any temporary toggles or fallback strategies if we see surprising affected sets.

## Notes

- Work for this phase happens on the `docs/ci-scope-optimization-phase-2` branch.
- See `_docs/milestones/active/ci-scope-optimization/phase-plans/phase-2-nx-affected-ci.md` for the full phase plan.


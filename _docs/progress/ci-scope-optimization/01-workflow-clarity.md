# Phase 1: Workflow clarity

## Scope

Clarify how CI decides what to run, make the behavior visible in logs and summaries, and document the docs-only vs Nx affected rules for contributors.

## Changes in this phase

- **CI workflow:**
  - Added a `Detect changes (docs-only guard)` job in `.github/workflows/ci.yml` to compute changed files and decide whether a run is docs-only.
  - Logged the docs-only decision and changed files to both the job logs and the GitHub Actions step summary.
  - Updated the main CI job to `CI (nx affected)` and switched lint/test/build to use `nx affected` targets when the run is not docs-only.
- **Documentation:**
  - Updated the root `README.md` **Lint, tests, and CI** section to describe:
    - The docs-only guard behavior.
    - When Nx affected runs and what it does.
    - Where to find the CI scope decision summary.

## Notes

- Docs-only detection currently treats `_docs/**` and Markdown-only changes as non-code. Future phases may refine the allowlist.
- The docs-only guard and Nx affected configuration will be iterated further in later phases, but the basic behavior and visibility are now in place.


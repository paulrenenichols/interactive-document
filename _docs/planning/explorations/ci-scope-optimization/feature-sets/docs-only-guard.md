# Feature set: docs-only-guard

## Problem

- CI currently runs full lint/test/build even when a change only touches `_docs/` or other non-code files.
- This slows down planning and documentation workflows (e.g. adding explorations) without improving safety.

## Proposal

Introduce a **docs-only guard** step early in CI that:

1. Computes the list of changed files (e.g. `git diff --name-only origin/main...HEAD`).
2. Checks whether **all** changed files match a small allowlist of non-code paths, such as:
   - `_docs/**`
   - `docs/**` (if truly non-code for this repo)
   - `*.md` in approved locations
3. If the change is docs-only:
   - Set an output like `docs_only = true`.
   - Skip heavy Nx tasks (lint/test/build) entirely.
   - Optionally run lightweight docs checks (markdown lint, link checks).

If **any** changed file falls outside the allowlist, treat the change as potentially code-impacting and run the full Nx-based CI pipeline.

## Constraints / rules

- The docs-only allowlist must **not** include paths that can change runtime behavior or build outputs.
- The logic should be clear enough that contributors can predict when their PR will be treated as docs-only.
- We should log the list of changed files and the docs-only decision to make debugging easy.

## Open questions

- Exact patterns to include in the allowlist for this repository.
- Whether to run any lightweight docs checks on docs-only PRs (and if so, which ones).

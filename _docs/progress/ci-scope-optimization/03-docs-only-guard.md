# Phase 3: Docs-only guard & polish

## Scope

Refine the docs-only guard behavior, clarify the allowlist and its risks, and document how to debug and adjust decisions over time.

## Planned chunks

1. **Chunk 1: Docs-only detection implementation**
   - Keep the simple allowlist (currently `_docs/**` and Markdown-only changes) but document it clearly and make it easy to reason about.
2. **Chunk 2: CI wiring for skip behavior**
   - Confirm that docs-only runs reliably skip Nx affected lint/test/build while still running the detection and summary job.
3. **Chunk 3: Documentation and guardrails**
   - Add docs explaining the allowlist, risks, and how to debug or extend docs-only behavior.

## Notes

- Work for this phase happens on the `docs/ci-scope-optimization-phase-3` branch.
- See `_docs/milestones/active/ci-scope-optimization/phase-plans/phase-3-docs-only-guard.md` for the full phase plan.


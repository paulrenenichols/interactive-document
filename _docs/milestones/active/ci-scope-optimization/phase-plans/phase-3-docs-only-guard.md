# Phase 3: Docs-only guard & polish

**Goal:** Implement and refine the docs-only guard behavior, plus finalize documentation and rollout details.  
**Estimated effort:** medium hours  
**Branch:** docs/ci-scope-optimization-phase-3

## Logical Chunks

1. **Chunk 1: Docs-only detection implementation**
   - Tasks: Implement a docs-only guard step that computes changed files (e.g. `git diff --name-only origin/main...HEAD`), checks against an allowlist (`_docs/**`, selected `*.md`, etc.), and publishes a `docs_only` output.
   - Output: CI job or script that reliably identifies docs-only changes and exposes the decision.

2. **Chunk 2: CI wiring for skip behavior**
   - Tasks: Use the docs-only flag to skip heavy Nx tasks when appropriate, and optionally run lightweight docs checks.
   - Output: CI workflow updates so docs-only PRs get fast, focused runs.

3. **Chunk 3: Documentation and guardrails**
   - Tasks: Finalize docs for allowlist paths, risks, and how to debug decisions; document how to extend or adjust the allowlist.
   - Output: Updated `_docs` and contributor docs with clear guidance on docs-only behavior.

## Execution Rules (Agent follows these strictly)

- **Per chunk:**
  1. Generate code/files.
  2. Run `npm run lint` (or equivalent—if no script, skip + note).
  3. Run `npm test` (skip if missing).
  4. If lint/test pass: `git add . && git commit -m "phase 3 - <chunk title>" && git push`.
  5. If fail: Pause → "Lint/test broke on chunk <current>. Fix? Or rollback?"
- **End of phase:**
  1. Run `npm run build` (if script exists—otherwise skip).
  2. Create PR: "Phase 3: Docs-only guard & polish" → merge (confirm with user).
  3. If last phase: Auto-complete milestone after merge.
- **Build config:** (set during plan) Build after every chunk? — default: no

## Notes / Dependencies

- Depends on high-level design and Nx affected wiring from earlier phases.
- Be conservative with allowlist; prefer safety over over-skipping.

**Ready?** Say "go" to start chunk 1.


# Phase 2: Nx affected CI

**Goal:** Use `nx affected` to drive lint/test/build for non-docs-only changes, scoped by the Nx project graph.  
**Estimated effort:** medium hours  
**Branch:** docs/ci-scope-optimization-phase-2

## Logical Chunks

1. **Chunk 1: Base Nx affected wiring**
   - Tasks: Add CI steps to run `nx affected -t lint`, `nx affected -t test`, and `nx affected -t build` for non-docs-only runs.
   - Output: Updated CI workflow YAML with basic Nx affected commands.

2. **Chunk 2: Base/head and parallelism**
   - Tasks: Configure base/head detection (default `origin/main...HEAD`, with overrides if needed), set sensible `--parallel` / `--maxParallel` values, and optional `--configuration=ci`.
   - Output: CI configuration that consistently scopes work and balances speed vs resource usage.

3. **Chunk 3: Safety and validation**
   - Tasks: Document and validate project graph assumptions, consider running Nx affected alongside legacy behavior temporarily, and capture any edge cases.
   - Output: Docs and possibly temporary CI toggles for safe rollout.

## Execution Rules (Agent follows these strictly)

- **Per chunk:**
  1. Generate code/files.
  2. Run `npm run lint` (or equivalent—if no script, skip + note).
  3. Run `npm test` (skip if missing).
  4. If lint/test pass: `git add . && git commit -m "phase 2 - <chunk title>" && git push`.
  5. If fail: Pause → "Lint/test broke on chunk <current>. Fix? Or rollback?"
- **End of phase:**
  1. Run `npm run build` (if script exists—otherwise skip).
  2. Create PR: "Phase 2: Nx affected CI" → merge (confirm with user).
  3. If last phase: Auto-complete milestone after merge.
- **Build config:** (set during plan) Build after every chunk? — default: no

## Notes / Dependencies

- Depends on docs-only guard behavior from Phase 1 being at least stubbed.
- Ensure Nx project graph is healthy before rollout.

**Ready?** Say "go" to start chunk 1.


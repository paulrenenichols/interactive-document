# Phase 1: Workflow clarity

**Goal:** Make CI scope rules visible and explainable so contributors understand when a run is docs-only vs full Nx affected CI.  
**Estimated effort:** medium hours  
**Branch:** docs/ci-scope-optimization-phase-1

## Logical Chunks

1. **Chunk 1: CI job naming and outputs**
   - Tasks: Align job names (e.g. `detect-changes (docs-only guard)`, `ci (nx affected)`), echo changed files and docs-only decision in logs, add summaries explaining scope decisions.
   - Output: Updated CI workflow YAML with clearer job names and logging of scope-related decisions.

2. **Chunk 2: Contributor-facing documentation**
   - Tasks: Document docs-only vs affected behavior in `_docs` and contributor docs (e.g. CONTRIBUTING / CI README), including examples.
   - Output: Updated `_docs` exploration/milestone docs and contributor docs describing CI scope behavior.

3. **Chunk 3: Rollout validation strategy**
   - Tasks: Define and document a validation period where the docs-only guard logs what it would do without skipping, and capture metrics/feedback.
   - Output: Rollout notes in `_docs` describing validation period, toggles, and success criteria.

## Execution Rules (Agent follows these strictly)

- **Per chunk:**
  1. Generate code/files.
  2. Run `npm run lint` (or equivalent—if no script, skip + note).
  3. Run `npm test` (skip if missing).
  4. If lint/test pass: `git add . && git commit -m "phase 1 - <chunk title>" && git push`.
  5. If fail: Pause → "Lint/test broke on chunk <current>. Fix? Or rollback?"
- **End of phase:**
  1. Run `npm run build` (if script exists—otherwise skip).
  2. Create PR: "Phase 1: Workflow clarity" → merge (confirm with user).
  3. If last phase: Auto-complete milestone after merge.
- **Build config:** (set during plan) Build after every chunk? — default: no

## Notes / Dependencies

- Requires existing CI workflow configuration for this repo.
- Coordinate with any in-flight CI refactors to avoid conflicts.

**Ready?** Say "go" to start chunk 1.


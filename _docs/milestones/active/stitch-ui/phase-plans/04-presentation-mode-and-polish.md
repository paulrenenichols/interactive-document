# Phase 4: Presentation mode and polish

**Goal:** Presenter experience per Stitch reference; final dark polish across milestone surfaces; Storybook/app parity checks.  
**Estimated effort:** medium hours  
**Branch:** docs/stitch-ui-phase-4

## Logical Chunks

1. **Chunk 1: Presentation viewport and chrome**
   - Tasks: Fullscreen/near-fullscreen route or mode; slide viewport; bottom or auto-hide controls; slide index/title.
   - Output: Presentation mode usable end-to-end.

2. **Chunk 2: Dark mode and cross-surface review**
   - Tasks: Pass over landing, auth, editor, inspector in `.dark`; fix token leaks; align with Enterprise Midnight cues where intended.
   - Output: Consistent dark behavior documented in progress doc.

3. **Chunk 3: Polish and coverage**
   - Tasks: Storybook stories for key surfaces if missing; a11y spot-check; deferrals (transitions, notes, laser) listed explicitly.
   - Output: Milestone acceptance notes in `_docs/progress/stitch-ui/04-presentation-mode-and-polish.md`.

## Execution Rules (Agent follows these strictly)

- **Per chunk:**
  1. Generate code/files.
  2. Run `npm run lint` (or equivalent—if no script, skip + note).
  3. Run `npm test` (skip if missing).
  4. If lint/test pass: `git add . && git commit -m "phase 4 - <chunk title>" && git push`.
  5. If fail: Pause → "Lint/test broke on chunk <current>. Fix? Or rollback?"
- **End of phase:**
  1. Run `npm run build` (if script exists—otherwise skip).
  2. Create PR: "Phase 4: Presentation mode and polish" → merge (confirm with user).
  3. If last phase: Auto-complete milestone after merge (move to `completed/09-stitch-ui/`, renumber if needed per `milestones/README.md` max + 1).
- **Build config:** Build after every chunk? — default: no

## Notes / Dependencies

- Transitions, laser pointer, speaker notes: default out—add only if explicitly scoped mid-phase.
- Completing this phase completes the **stitch-ui** milestone: follow skill “Mark milestone completed” workflow after merge.

**Ready?** Say "go" to start chunk 1.

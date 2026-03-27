# Phase 2: Editor shell and canvas

**Goal:** Editor chrome and canvas aligned with Stitch light editor reference—shell, slide list, work area, toolbars—without forking layout for dark.  
**Estimated effort:** high hours  
**Branch:** docs/stitch-ui-phase-2

## Logical Chunks

1. **Chunk 1: App shell and navigation**
   - Tasks: AppBar, Drawer (slide list / thumbnails), layout composition; integrate with existing deck/editor state.
   - Output: Shell components/routes updated; tokens for surfaces.

2. **Chunk 2: Canvas and slide surface**
   - Tasks: Canvas `Paper`/`Box` treatment, zoom/fit as applicable; subtle borders per light DS.
   - Output: Canvas matches exploration `editor-canvas.md` light structure.

3. **Chunk 3: Toolbars, menus, overlays**
   - Tasks: IconButton clusters, Menu, Dialog/Popover patterns; spacing per Stitch “no harsh dividers.”
   - Output: Toolbar and modal patterns consistent with shell.

## Execution Rules (Agent follows these strictly)

- **Per chunk:**
  1. Generate code/files.
  2. Run `npm run lint` (or equivalent—if no script, skip + note).
  3. Run `npm test` (skip if missing).
  4. If lint/test pass: `git add . && git commit -m "phase 2 - <chunk title>" && git push`.
  5. If fail: Pause → "Lint/test broke on chunk <current>. Fix? Or rollback?"
- **End of phase:**
  1. Run `npm run build` (if script exists—otherwise skip).
  2. Create PR: "Phase 2: Editor shell and canvas" → merge (confirm with user).
  3. If last phase: Auto-complete milestone after merge.
- **Build config:** Build after every chunk? — default: no

## Notes / Dependencies

- Phase 1 token work should be merged or compatible before heavy editor styling.
- Docked vs floating inspector: follow current app architecture; phase 3 covers inspector content.

**Ready?** Say "go" to start chunk 1.

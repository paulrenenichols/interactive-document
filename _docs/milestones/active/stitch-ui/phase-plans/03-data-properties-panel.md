# Phase 3: Data properties panel

**Goal:** Inspector / data-properties panel with a **single** agreed IA; dense forms and lists using MUI + tokens.  
**Estimated effort:** medium hours  
**Branch:** docs/stitch-ui-phase-3

## Logical Chunks

1. **Chunk 1: IA lock and structure**
   - Tasks: Merge baseline vs “updated” Stitch panel into one spec (short doc or comment in phase); choose Drawer vs persistent rail to match app.
   - Output: Written decision; component tree sketch if helpful.

2. **Chunk 2: Panel shell and sections**
   - Tasks: Tabs or Accordion; panel background from `surface-container-high` analog; wiring to editor selection.
   - Output: Shell UI integrated with editor from phase 2.

3. **Chunk 3: Form controls and lists**
   - Tasks: TextField, Select, Switch, Slider, Autocomplete as needed; List/ListItem spacing without `<hr>` clutter.
   - Output: Functional inspector matching exploration scope.

## Execution Rules (Agent follows these strictly)

- **Per chunk:**
  1. Generate code/files.
  2. Run `npm run lint` (or equivalent—if no script, skip + note).
  3. Run `npm test` (skip if missing).
  4. If lint/test pass: `git add . && git commit -m "phase 3 - <chunk title>" && git push`.
  5. If fail: Pause → "Lint/test broke on chunk <current>. Fix? Or rollback?"
- **End of phase:**
  1. Run `npm run build` (if script exists—otherwise skip).
  2. Create PR: "Phase 3: Data properties panel" → merge (confirm with user).
  3. If last phase: Auto-complete milestone after merge.
- **Build config:** Build after every chunk? — default: no

## Notes / Dependencies

- Depends on editor shell (phase 2) for selection context and layout.

**Ready?** Say "go" to start chunk 1.

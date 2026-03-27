# Phase 3: Data properties panel

**Goal:** Inspector / data-properties panel with a **single** agreed IA; dense forms and lists using MUI + tokens.  
**Estimated effort:** medium hours  
**Branch:** docs/stitch-ui-phase-3

## Logical Chunks

1. **Chunk 1: IA lock and structure**
   - Tasks: Merge baseline vs “updated” Stitch panel into one spec (short doc or comment in phase); choose Drawer vs persistent rail to match app.
   - Output: Written decision; component tree sketch if helpful. (Stories optional this chunk if no UI shipped; add when components exist.)

2. **Chunk 2: Panel shell and sections**
   - Tasks: Tabs or Accordion; panel background from `surface-container-high` analog; wiring to editor selection.
   - Output: Shell UI integrated with editor from phase 2; stories **where the panel UI code lives** (`apps/frontend` and/or `libs/material-ui`).

3. **Chunk 3: Form controls and lists**
   - Tasks: TextField, Select, Switch, Slider, Autocomplete as needed; List/ListItem spacing without `<hr>` clutter.
   - Output: Functional inspector matching exploration scope; stories for new/changed inspector components **where code lives**.

## Execution Rules (Agent follows these strictly)

- **Per chunk:**
  1. Generate code/files.
  2. **Storybook (where code lives):** If this chunk adds or materially changes user-facing UI, add or update colocated `*.stories.tsx` (or the repo’s established pattern) in the **same project where the code lives**—e.g. `apps/frontend` vs `libs/material-ui`, each with its own `.storybook/` when applicable. Skip pure helpers, API-only changes, or pieces with no sensible isolated UI. If only an existing story’s props need updating, update that story.
  3. Run `npm run lint` (or equivalent—if no script, skip + note).
  4. Run `npm test` (skip if missing).
  5. If lint/test pass: `git add . && git commit -m "phase 3 - <chunk title>" && git push`.
  6. If fail: Pause → "Lint/test broke on chunk <current>. Fix? Or rollback?"
- **End of phase:**
  1. Run `npm run build` (if script exists—otherwise skip).
  2. Optional: Spot-check Storybook (`nx storybook frontend` and/or `nx storybook material-ui` as applicable).
  3. Create PR: "Phase 3: Data properties panel" → merge (confirm with user).
  4. If last phase: Auto-complete milestone after merge.
- **Build config:** Build after every chunk? — default: no

## Notes / Dependencies

- Depends on editor shell (phase 2) for selection context and layout.

**Ready?** Say "go" to start chunk 1.

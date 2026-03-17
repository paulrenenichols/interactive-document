# Phase 2: Slides editor and viewer UX

**Goal:** Refine and extend the Google Slides–style editor and viewer UX using a Storybook-first approach, then wire the screens into the Next.js app (editor and optional presenter view).  
**Estimated effort:** medium hours  
**Branch:** docs/auth-and-slides-ux-phase-2

## Logical Chunks

Break work into bite-sized steps. Agent will handle one at a time.

1. **Chunk 1: Storybook screens for Slides editor and presenter view**
   - Tasks: Build `SlidesEditorScreen` (and optional `PresenterViewScreen`) as Storybook screens that follow the layout and interaction guidance from `google-slides-ux.md`, using mocked deck data.
   - Output: Screen-level stories under `apps/frontend/components/editor/` (or similar) covering core editor and viewer states.

2. **Chunk 2: Keyboard shortcuts and interaction polish**
   - Tasks: Implement and validate the proposed keyboard shortcuts (e.g. Ctrl+M, Ctrl+D, Ctrl+Z/Y, Ctrl+Alt+C, F5/Ctrl+F5) and refine drag-and-drop, selection, and panel behavior.
   - Output: Updated stories and docs showing shortcut behavior and interaction patterns; notes on any deviations from the original spec.

3. **Chunk 3: Wire editor/viewer screens into Next.js routes**
   - Tasks: Integrate the Storybook-authored editor and viewer screens into the Next.js app routes (e.g. `/edit/[deckId]`, `/present/[deckId]`), ensuring consistent theming and responsive behavior.
   - Output: Working Next.js editor and viewer routes using the Storybook-authored components, with basic end-to-end smoke verification.

## Execution Rules (Agent follows these strictly)

- **Per chunk:**
  1. Generate code/files.
  2. Run `npm run lint` (or equivalent—if no script, skip + note).
  3. Run `npm test` (skip if missing).
  4. If lint/test pass: `git add . && git commit -m "phase 2 - <chunk title>" && git push`.
  5. If fail: Pause → "Lint/test broke on chunk 2. Fix? Or rollback?"
- **End of phase:**
  1. Run `npm run build` (if script exists—otherwise skip).
  2. Create PR: "Phase 2: Slides editor and viewer UX" → merge (confirm with user).
  3. If last phase: Auto-complete milestone after merge.
- **Build config:** (set during plan) Build after every chunk? — default: no

## Notes / Dependencies

- Uses the editor layout and interaction guidance from `google-slides-ux.md` and the Storybook configuration described in `storybook-setup.md`.
- Theming should follow the semantic tokens in `theme.md` so auth, editor, and viewer share a consistent palette.
- Tests failing? Prioritize fixes before commit.
- Conflicts? Pause and ask: "Merge conflict—resolve manually?"

**Ready?** Say "go" to start chunk 1.


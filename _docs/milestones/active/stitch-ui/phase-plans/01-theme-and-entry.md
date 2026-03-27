# Phase 1: Theme and entry

**Goal:** Align theme tokens with Stitch design-system narratives and ship marketing + auth surfaces to canonical light layouts with consistent `.dark` behavior.  
**Estimated effort:** high hours  
**Branch:** docs/stitch-ui-phase-1

## Logical Chunks

1. **Chunk 1: Token audit and theme.css updates**
   - Tasks: Map Structure & Logic + Enterprise Midnight priorities to existing CSS variables; close gaps for surfaces, text, accent; note deltas vs Stitch in progress doc.
   - Output: Updates in `libs/material-ui/src/theme.css` (and related) as needed; `_docs/progress/stitch-ui/01-theme-and-entry.md` section for decisions.

2. **Chunk 2: Marketing landing**
   - Tasks: Implement landing per exploration (hero, nav, sections, footer); single IA; responsive layout; Storybook and/or app route as project convention.
   - Output: Frontend (and stories if applicable) matching light reference; dark via tokens only.

3. **Chunk 3: Authentication screens**
   - Tasks: Sign-in card layout, fields, links; match exploration `authentication.md`; ensure ThemeProvider / `.dark` works.
   - Output: Auth routes or Storybook stories per existing app patterns.

## Execution Rules (Agent follows these strictly)

- **Per chunk:**
  1. Generate code/files.
  2. Run `npm run lint` (or equivalent—if no script, skip + note).
  3. Run `npm test` (skip if missing).
  4. If lint/test pass: `git add . && git commit -m "phase 1 - <chunk title>" && git push`.
  5. If fail: Pause → "Lint/test broke on chunk <current>. Fix? Or rollback?"
- **End of phase:**
  1. Run `npm run build` (if script exists—otherwise skip).
  2. Create PR: "Phase 1: Theme and entry" → merge (confirm with user).
  3. If last phase: Auto-complete milestone after merge.
- **Build config:** Build after every chunk? — default: no

## Notes / Dependencies

- SSO/OAuth: out of scope unless product adds flows.
- PRD HTML: narrative only—not a layout target.
- Tests failing? Prioritize fixes before commit.
- Conflicts? Pause and ask: "Merge conflict—resolve manually?"

**Ready?** Say "go" to start chunk 1.

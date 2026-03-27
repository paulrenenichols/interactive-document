# Phase 1: Theme and entry

**Goal:** Align theme tokens with Stitch design-system narratives and ship marketing + auth surfaces to canonical light layouts with consistent `.dark` behavior.  
**Estimated effort:** high hours  
**Branch:** docs/stitch-ui-phase-1

## Logical Chunks

1. **Chunk 1: Token audit and theme.css updates**
   - Tasks: Map Structure & Logic + Enterprise Midnight priorities to existing CSS variables; close gaps for surfaces, text, accent; note deltas vs Stitch in progress doc.
   - Output: Updates in `libs/material-ui/src/theme.css` (and related) as needed; `_docs/progress/stitch-ui/01-theme-and-entry.md` section for decisions. (No Storybook unless token work ships demo components in a Storybook-backed project.)

2. **Chunk 2: Marketing landing**
   - Tasks: Implement landing per exploration (hero, nav, sections, footer); single IA; responsive layout; Storybook and/or app route as project convention.
   - Output: Frontend matching light reference; dark via tokens only; `*.stories.tsx` in `apps/frontend` where landing components are added or changed.

3. **Chunk 3: Authentication screens**
   - Tasks: Sign-in card layout, fields, links; match exploration `authentication.md`; ensure ThemeProvider / `.dark` works.
   - Output: Auth routes per existing app patterns; add or update colocated `*.stories.tsx` in `apps/frontend` for any auth UI touched.

## Execution Rules (Agent follows these strictly)

- **Per chunk:**
  1. Generate code/files.
  2. **Storybook (where code lives):** If this chunk adds or materially changes user-facing UI, add or update colocated `*.stories.tsx` (or the repo’s established pattern) in the **same project where the code lives**—e.g. `apps/frontend` vs `libs/material-ui`, each with its own `.storybook/` when applicable. Skip pure helpers, API-only changes, or pieces with no sensible isolated UI. If only an existing story’s props need updating, update that story.
  3. Run `npm run lint` (or equivalent—if no script, skip + note).
  4. Run `npm test` (skip if missing).
  5. If lint/test pass: `git add . && git commit -m "phase 1 - <chunk title>" && git push`.
  6. If fail: Pause → "Lint/test broke on chunk <current>. Fix? Or rollback?"
- **End of phase:**
  1. Run `npm run build` (if script exists—otherwise skip).
  2. Optional: Spot-check Storybook (`nx storybook frontend` and/or `nx storybook material-ui` if that project’s UI changed).
  3. Create PR: "Phase 1: Theme and entry" → merge (confirm with user).
  4. If last phase: Auto-complete milestone after merge.
- **Build config:** Build after every chunk? — default: no

## Notes / Dependencies

- Marketing and auth in `apps/frontend` already include Storybook patterns (`LandingPage`, `LoginScreen`, `RegisterScreen`); new or changed entry UI must add/update stories **where the code lives**.
- SSO/OAuth: out of scope unless product adds flows.
- PRD HTML: narrative only—not a layout target.
- Tests failing? Prioritize fixes before commit.
- Conflicts? Pause and ask: "Merge conflict—resolve manually?"

**Ready?** Say "go" to start chunk 1.

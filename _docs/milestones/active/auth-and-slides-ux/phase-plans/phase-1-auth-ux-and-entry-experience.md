# Phase 1: Auth UX and entry experience

**Goal:** Design and implement Storybook-first auth screens (login and sign-up) with a polished first-time vs returning user experience, wired into the Next.js app after the screens are solid.  
**Estimated effort:** medium hours  
**Branch:** docs/auth-and-slides-ux-phase-1

## Logical Chunks

Break work into bite-sized steps. Agent will handle one at a time.

1. **Chunk 1: Storybook screens for Login and Register**
   - Tasks: Build `LoginScreen`, `RegisterScreen`, and shared `AuthLayout` in Storybook using the existing `apps/frontend` Storybook setup and mocks; cover key states (loading, success, validation errors, backend errors).
   - Output: Screen-level stories under `apps/frontend/components/auth/` (or similar) with realistic mocked data/flows, using the semantic theme tokens from `supporting-docs/theme.md`.

2. **Chunk 2: Flows, first-time vs returning UX, and interactions**
   - Tasks: Refine flows for first-time vs returning users, including “remember me”, links between login and sign-up, and password reset entry points; ensure accessibility and keyboard navigation.
   - Output: Updated stories and docs showing the full auth flow variations, plus notes in the exploration/milestone docs about UX decisions.

3. **Chunk 3: Wire Storybook-authored screens into Next.js routes**
   - Tasks: Integrate the auth screens into the actual Next.js app routes (e.g. `/login`, `/register`) using the same layout and theming, connecting to real or stubbed backend auth endpoints as appropriate.
   - Output: Working Next.js auth routes using the Storybook-authored components, with basic end-to-end smoke verification.

## Execution Rules (Agent follows these strictly)

- **Per chunk:**
  1. Generate code/files.
  2. Run `npm run lint` (or equivalent—if no script, skip + note).
  3. Run `npm test` (skip if missing).
  4. If lint/test pass: `git add . && git commit -m "phase 1 - <chunk title>" && git push`.
  5. If fail: Pause → "Lint/test broke on chunk 1. Fix? Or rollback?"
- **End of phase:**
  1. Run `npm run build` (if script exists—otherwise skip).
  2. Create PR: "Phase 1: Auth UX and entry experience" → merge (confirm with user).
  3. If last phase: Auto-complete milestone after merge.
- **Build config:** (set during plan) Build after every chunk? — default: no

## Notes / Dependencies

- Requires the existing Storybook setup for `apps/frontend` described in the `auth-and-slides-ux` exploration’s supporting docs (see `storybook-setup.md`).
- Auth backend changes are only in scope insofar as they affect UX and flows; full backend auth migration is out of scope.
- Tests failing? Prioritize fixes before commit.
- Conflicts? Pause and ask: "Merge conflict—resolve manually?"

**Ready?** Say "go" to start chunk 1.


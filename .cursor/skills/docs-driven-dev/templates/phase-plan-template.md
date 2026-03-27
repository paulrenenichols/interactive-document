<!-- Phase Plan Template -->

# Phase {{phase_number}}: {{phase_name}}

**Goal:** {{brief_goal_description}}  
**Estimated effort:** {{low/medium/high}} hours  
**Branch:** docs/{{milestone_slug}}-phase-{{phase_number}}

## Logical Chunks

Break work into bite-sized steps. Agent will handle one at a time.

1. **Chunk 1: {{chunk_1_title}}**
   - Tasks: {{list_tasks_here}}
   - Output: {{expected_files_or_changes}}

2. **Chunk 2: {{chunk_2_title}}**
   - Tasks: ...
   - Output: ...

3. **Chunk 3: {{chunk_3_title}}**
   - (add as many as needed)

## Execution Rules (Agent follows these strictly)

- **Per chunk:**
  1. Generate code/files.
  2. **Storybook (when the workspace has Storybook — see below):** If this chunk adds or materially changes user-facing UI, add or update colocated `*.stories.tsx` (or the repo’s established pattern) in the **same project where the code lives** (e.g. `apps/<app>/` vs `libs/<lib>/`, each with its own `.storybook/` when applicable). Prefer stories for the **composed component** a framework page renders (e.g. Next.js); avoid duplicating full route files in Storybook unless the project already does that. Skip pure helpers, API-only changes, generated-only files, trivial re-exports, or pieces with no sensible isolated UI; update existing stories when props change. **Detection:** Storybook applies if `apps/<app>/.storybook/` or `libs/<lib>/.storybook/` exists, or `nx show project <name> --json` lists a `storybook` target for the project you touched, or package scripts document Storybook for that app/lib. If none apply, skip this step and note.
  3. Run `npm run lint` (or equivalent—if no script, skip + note).
  4. Run `npm test` (skip if missing).
  5. If lint/test pass: `git add . && git commit -m "phase {{phase_number}} - {{chunk_title}}" && git push`.
  6. If fail: Pause → "Lint/test broke on chunk {{current}}. Fix? Or rollback?"
- **End of phase:**
  1. Run `npm run build` (if script exists—otherwise skip).
  2. Optional: Spot-check Storybook for project(s) where UI changed (`nx storybook <project>` or manual).
  3. Create PR: "Phase {{phase_number}}: {{phase_name}}" → merge (confirm with user).
  4. If last phase: Auto-complete milestone after merge.
- **Build config:** (set during plan) Build after every chunk? — default: no

## Notes / Dependencies

- For UI-heavy phases, mention **that project’s** theming (e.g. app `globals.css` + `.storybook/preview`) so stories match app dark/light behavior.
- {{any_prereqs_or_warnings}}
- Tests failing? Prioritize fixes before commit.
- Conflicts? Pause and ask: "Merge conflict—resolve manually?"

**Ready?** Say "go" to start chunk 1.

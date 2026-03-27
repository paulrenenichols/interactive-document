# Changelog

## [2.1.0] - 2026-03-27

### Added
- **Phase execution + phase plans:** Conditional **Storybook** step per chunk when the target workspace has Storybook (detect via `.storybook/` on app/lib, Nx `storybook` target, or documented scripts). Add/update `*.stories.tsx` **where the code lives**; prefer composed components over duplicating full route files. Optional Storybook spot-check at end of phase.
- **phase-plan-template.md** (and `_docs/v2` copy): Execution Rules now include the Storybook step, detection text, Notes for theming alignment, and renumbered per-chunk / end-of-phase steps.

### Changed
- **SKILL.md** Phase execution and Help: document Storybook alongside lint/test/commit.
- **setup/milestone-lifecycle.md** step 3: Phase plans should retain Storybook clause when the project uses Storybook; per-chunk flow mentions Storybook between generate and lint.

## [2.0.0] - 2026-03-16

### Added
- **Plan-first mode:** Setup, convert, upgrade, create/update exploration, and create milestone now build a draft in memory first; no disk writes until user says "go", "apply", or "execute". Agent prompts: "Plan ready—review/add docs. Say 'go' to apply." and "Updates detected—refine, or 'go'?"
- **Phase execution (chunk-level):** "Implement phase" / "go" (with active milestone) runs phase-plan per chunk: generate → lint → test → commit ("phase X - chunk Y") → push; end of phase: build → PR → merge (confirm). Last phase: auto-complete milestone after merge. Config: "Build after every chunk?" (default no).
- **Unified branch pattern:** `docs/<milestone-or-exploration>-<name>` with collision suffix (-2, -3). Phase branches: `docs/<milestone>-phase-<phase_number>`. Fetch origin before checks.
- **Validation:** On every trigger, quick "validate state" (version, _docs, git, drift). Report "All good" or "Fixes needed: …". Optional triggers: "validate", "validate state", "validate docs".
- **Rollback:** "rollback phase" (revert last phase commits) and "rollback chunk" (revert last chunk commit), with confirmation.
- **Watchdog:** Background state checker on create/implement/upgrade/merge: prompts "Milestone complete—finish now?", "Docs stale—validate?", "Phase open—continue or rollback?" (half-done phase ~30 min). See `setup/watchdog-rules.md`.
- **Upgrade from GitHub:** "Upgrade docs" fetches latest from skill repo, compares version/content; "Overwrite skill files? Yes/No". If yes, copy files then "evaluate project" (scan _docs for outdated structures → "Project needs: … Apply? Yes/No"). Binary overwrite or skip.
- **Templates and setup layout:** Explicit `templates/` (phase-plan-template, exploration-template, milestone-template, readme-docs-section, progress-sync-template) and `setup/` (project-lifecycle, exploration-lifecycle, milestone-lifecycle, watchdog-rules). Phase plans use phase-plan-template.md (Logical Chunks, Execution Rules). Setup includes watchdog-rules.md.
- **Trigger table:** "make active" short form; implement phase, rollback, validate triggers; apply-plan triggers (go, apply, execute) documented.

### Changed
- Git: auto-init prompt if no repo ("No repo—init now?"). Dead branches: after merge, list "These look dead: … Delete any? (y/n per branch)" — no auto-delete.
- Make milestone active: branch options (a) activation only `docs/milestone-<name>-activate`, (b) start first phase `docs/<milestone>-phase-1`.
- Setup (section 1) and convert (section 2) now copy `watchdog-rules.md` to _docs/planning/setup/.
- Lifecycle docs updated for v2: branch names, plan-first/go, phase-plan template, progress structure, link to watchdog-rules.md.
- README template (readme-docs-section.md): plan-first step, "go" to apply, implement phase, rollback, validate.

## [1.5.0] - 2026-03-15

### Added
- **Exploration folder numerical prefix:** When marking a milestone completed (section 8), the skill now renames `planning/explorations/completed/<name>/` to `planning/explorations/completed/<NN>-<name>/` using the same number prefix, and instructs to update any links in _docs that point to the exploration.

## [1.4.0] - 2026-03-15

### Added
- **Progress folder numerical prefix:** When marking a milestone completed (section 8), the skill now renames `progress/<name>/` to `progress/<NN>-<name>/` using the same number prefix as the milestone, so progress folder names stay aligned with completed milestone numbering.

### Changed
- Upgrade docs (section 3): new step **Align progress folder prefixes** (v1.4.0) — for each completed milestone in `milestones/completed/`, if `progress/` has a folder with the same base name but no number prefix, rename it to the prefixed form. Fixes progress folders (e.g. `developer-experience`) that were completed before the skill added progress prefixing.

## [1.3.0] - 2026-03-12

### Changed
- Phase execution workflow: when the phase just merged is the milestone's **last phase**, prompt to mark milestone completed (move active → completed, add number prefix) so milestones are not left in active
- "Mark milestone completed" (section 8) is now explicitly tied to finishing the last phase; instructions say to do it as part of closing out the final phase
- Milestone lifecycle doc: phase-plan convention now includes a "last phase only" step — after the final phase's PR is merged, move milestone to completed

## [1.2.0] - 2026-03-12

### Added
- Explorations turned into milestones are now moved to `_docs/planning/explorations/completed/`
- Setup and upgrade workflows create the `explorations/completed/` folder

### Changed
- "Create milestone from exploration" workflow (section 6) now moves the source exploration to `completed/` and fixes relative links

> Entries below v1.2.0 were reconstructed from git history.

## [1.1.0] - 2026-03-10

### Changed
- Improved phase execution workflow (one phase at a time, user testing, PR/merge cycle)
- Expanded README template with "How to use the skill" subsection and trigger examples
- Added cursor-skills links to Supersedes section in README

## [1.0.0] - 2026-03-09

### Added
- Initial release consolidating scaffold-docs and scaffold-exploration into a single skill
- 8 workflows: setup docs, convert project, upgrade docs, create/update exploration, create milestone from exploration, activate milestone, complete milestone
- Git branching patterns for all operations
- Skill embedding into projects (`.cursor/skills/docs-driven-dev/`)
- Project README template with docs-driven development section
- Setup lifecycle files: project-lifecycle, milestone-lifecycle, exploration-lifecycle

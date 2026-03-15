# Changelog

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

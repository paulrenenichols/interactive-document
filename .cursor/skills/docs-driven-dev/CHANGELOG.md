# Changelog

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

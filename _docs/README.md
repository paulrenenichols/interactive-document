# _docs

Updated with the **docs-driven-dev** skill (v1.0.0).

Project and process documentation: overview, definitions, milestones, phase plans, setup guides, progress, and planning.

## Structure

- **milestones/** — Completed, active, and future. Each has `completed/`, `active/`, `future/`; only completed use number prefixes (e.g. `01-setup`, `02-mvp`). See [milestones/README.md](milestones/README.md).
- **progress/** — Mirrors milestones: `progress/completed/`, `progress/active/`, `progress/future/`. Use `progress/miscellaneous/` for work not on milestone branches.
- **planning/** — Setup guides (`planning/setup/`), explorations (`planning/explorations/`), and 00-initial-milestones (overview and definition docs in `planning/milestones/00-initial-milestones/`).
- **updates/** — One-off workflow or process change prompts.

## Where to start

- **New project:** [planning/setup/project-lifecycle.md](planning/setup/project-lifecycle.md)
- **New milestone:** [planning/setup/milestone-lifecycle.md](planning/setup/milestone-lifecycle.md)
- **Evaluate an exploration:** [planning/setup/exploration-lifecycle.md](planning/setup/exploration-lifecycle.md)
- **Current progress:** [progress/](progress/)
- **Run a phase:** `milestones/completed/<milestone>/phase-plans/<phase>.md` (or active/future when applicable)

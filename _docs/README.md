# _docs

Project and process documentation: overview, definitions, milestones, phase plans, setup guides, progress, and planning.

## Structure

- **milestones/** – Milestone and phase structure. Each milestone (e.g. `01-setup`, `02-mvp`) has `phases/` (short scope and goals) and `phase-plans/` (step-by-step execution: branch, checkpoints, READMEs, progress doc, final step on user approval).
- **progress/** – What was done. One subfolder per milestone; one markdown file per phase (e.g. `02-mvp/04-slide-editor.md`). Use `progress/miscellaneous/` for work on branches that are not milestone/phase branches (e.g. `docs-workflow-update-2026-March-04.md`).
- **planning/** – Setup guides (`planning/setup/`), explorations (`planning/explorations/`), and for the initial scope: project overview and definition under `planning/milestones/00-initial-milestones/` (`project-overview/`, `definition/`). Explorations are research folders for proposed feature sets; use `planning/setup/explorations-evaluation.md` to evaluate an exploration and optionally turn it into a milestone. For new milestones, `planning/milestones/<NN-milestone>/project-overview` and `definition` can be added when the milestone has its own scope (see new-milestone-setup).
- **updates/** – Prompt documents for one-off workflow or process changes (e.g. new folders, new steps in phase plans). Use these to drive changes like the March 04 workflow update; they are not part of the regular setup flow.

## Where to start

- **New project:** `planning/setup/new-project-setup.md`
- **New milestone:** `planning/setup/new-milestone-setup.md`
- **Evaluate an exploration:** `planning/setup/explorations-evaluation.md`
- **Current progress:** `progress/` (by milestone or `miscellaneous/`)
- **Run a phase:** `milestones/<milestone>/phase-plans/<phase>.md`

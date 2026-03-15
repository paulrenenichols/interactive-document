# Milestone lifecycle

Use this guide when **adding a new milestone** to an existing project. For creating a project from scratch, use [project-lifecycle.md](project-lifecycle.md).

## Parameters

- **Milestone identifier:** Name (e.g. `developer-experience`, `scale`). No number prefix — new milestones go in `future/`; numbers are added when the milestone is completed.
- **Phase names:** One or more phases (e.g. `01-infra`, `02-caching`). Each gets a file in `phases/` and `phase-plans/` with the same number-prefixed filename.

## Milestone structure

Milestones live under `_docs/milestones/` in one of three folders:

- **future/** — Planned. New milestones go here with no number prefix.
- **active/** — In progress. Moved here when work starts; run accuracy pass (quick scan of phases/phase-plans; full scan if problematic).
- **completed/** — Done. Moved here when finished; add number prefix (max + 1).

## Steps

1. **Milestone-specific planning**
   - Create `_docs/planning/milestones/<name>/` (e.g. `_docs/planning/milestones/developer-experience/`).
   - Add README.md (overview, links to topic files).
   - Add topic files as needed (auth, tech-stack, etc.). Use 00-initial-milestones as a guide.
   - **Pause for review.**

2. **Create the milestone folder**
   - Add `_docs/milestones/future/<name>/` (e.g. `_docs/milestones/future/developer-experience/`).
   - Inside: `phases/` and `phase-plans/`.
   - **Pause for review.**

3. **Create phase and phase-plan files**
   - In `phases/`: one markdown file per phase (e.g. `01-infra.md`, `02-caching.md`).
   - In `phase-plans/`: same filenames, execution plans. Each must:
     - **First step:** Create and check out branch `<milestone>/<phase>` (e.g. `developer-experience/01-infra`).
     - **During:** Add, commit, push at logical points.
     - **README step:** Add/update project-root and per-app READMEs on completion.
     - **Progress doc:** Add/update `_docs/progress/<milestone>/<phase>.md`.
     - **Final step:** On user approval, add, commit, push final changes.
   - **Last phase only:** When this phase is the milestone's final phase, after the PR is merged the milestone must be moved from `active/` to `completed/` with a number prefix, and `milestones/README.md` updated (see "Mark milestone completed" in the docs-driven-dev skill).
   - **Pause for review.**

4. **Progress folder**
   - Ensure `_docs/progress/<name>/` exists with README.md.

5. **Update milestones/README.md**
   - Add the new milestone to the Future milestones section with summary and link.

## References

- Phase plan conventions: [project-lifecycle.md](project-lifecycle.md)
- Turn exploration into milestone: [exploration-lifecycle.md](exploration-lifecycle.md)

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
   - In `phase-plans/`: same filenames. Use the skill's **phase-plan-template.md** (Logical Chunks, Execution Rules — includes conditional **Storybook** step when the target workspace has Storybook; stories live **where the code lives**, e.g. per-app or per-lib `.storybook/`). If the project uses Storybook, keep that clause in **Execution Rules** (the template includes it by default). Branch: `docs/<milestone>-phase-<phase_number>` (e.g. `docs/developer-experience-phase-1`). Per chunk: generate → Storybook (if applicable) → lint → test → commit → push; end of phase: build → optional Storybook spot-check → PR → merge. Say "go" or "implement phase" to run. Progress doc: `_docs/progress/<milestone>/<phase>.md`.
   - **Last phase only:** When this phase is the milestone's final phase, after the PR is merged the milestone must be moved from `active/` to `completed/` with a number prefix; the `progress/<name>/` and `planning/explorations/completed/<name>/` folders (if present) must be renamed with the same prefix; and `milestones/README.md` updated (see "Mark milestone completed" in the docs-driven-dev skill). The watchdog will prompt: "Milestone complete—finish now?" (see [watchdog-rules.md](watchdog-rules.md)).
   - **Pause for review.**

4. **Progress folder**
   - Ensure `_docs/progress/<name>/` exists with README.md.

5. **Update milestones/README.md**
   - Add the new milestone to the Future milestones section with summary and link.

## References

- Phase plan conventions: [project-lifecycle.md](project-lifecycle.md)
- Turn exploration into milestone: [exploration-lifecycle.md](exploration-lifecycle.md)

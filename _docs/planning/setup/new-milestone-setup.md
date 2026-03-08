# New Milestone Setup

Use this guide when **adding a new milestone** to an existing project. For creating a project from scratch, use [new-project-setup.md](new-project-setup.md).

## Parameters

When running the prompts below, supply:

- **Milestone identifier:** Number and name (e.g. `04-scale`, `05-analytics`). Must match the naming in `_docs/milestones/` (number-prefixed, lowercase).
- **Phase names:** One or more phases (e.g. `01-infra`, `02-caching`). Each gets a file in `phases/` and `phase-plans/` with the same number-prefixed filename.

## Workflow

Pause after each step to review decisions before continuing to the next.

## Steps

1. **Milestone-specific planning (required)**

   - Create `_docs/planning/milestones/<NN-milestone>/` (e.g. `_docs/planning/milestones/04-scale/`).
   - Add **README.md** in that folder with the project overview (summary, scope, goals) and **links to the other planning files** in the same folder. GitHub will render it when you open the milestone folder.
   - Add one markdown file per topic as needed (e.g. auth.md, project-rules.md, tech-stack.md). Use the files in `_docs/planning/milestones/00-initial-milestones/` (README.md and topic files such as auth.md, project-rules.md) only as a **guide** for content types—the breakdown varies by milestone (e.g. skip auth for a dev-experience milestone; add 3D/model docs for a WebGL milestone). The README links to these files.
   - **Pause for review.**

2. **Create the milestone folder under `_docs/milestones/`**

   - Add `_docs/milestones/<NN-milestone>/` (e.g. `_docs/milestones/04-scale/`).
   - Inside it, create two subfolders: `phases/` and `phase-plans/`.
   - **Pause for review.**

3. **Create phase description and phase plan files**

   - In `_docs/milestones/<NN-milestone>/phases/`, add one markdown file per phase (e.g. `01-infra.md`, `02-caching.md`) with a short description of scope and goals.
   - In `_docs/milestones/<NN-milestone>/phase-plans/`, add one markdown file per phase with the **same filenames**, containing the execution plan. Each phase plan must:
     - **First step:** Create and check out branch `<NN-milestone>/<NN-phase>` (e.g. `04-scale/01-infra`).
     - **During the phase:** Include add, commit, and push at logical points.
     - **README step:** When the phase is completed, add or update project-root and per-app READMEs.
     - **Progress documentation:** When the agent completes the phase, add or update `_docs/progress/<NN-milestone>/<NN-phase>.md` with a summary of work done; after user approval, do a final pass on that progress doc and include it in the final commit/push.
     - **Final step:** When the user approves the phase as complete, add, commit, and push the final changes (including any progress doc update).
   - **Pause for review.**

4. **Progress folder**

   - Ensure `_docs/progress/<NN-milestone>/` exists. It will be used when each phase is completed (progress docs created per phase as above).
   - **Pause for review.**

## Example prompt

```
Create a new milestone 04-scale with two phases: 01-infra and 02-caching.

- First, create the milestone planning folder at _docs/planning/milestones/04-scale/ with README.md (project overview + links to other planning files) and any topic files needed for this milestone (use _docs/planning/milestones/00-initial-milestones/ as a guide for content types). Pause for review.
- Add _docs/milestones/04-scale/ with phases/ and phase-plans/. Pause for review.
- In phases/, add 01-infra.md and 02-caching.md with brief scope and goals.
- In phase-plans/, add 01-infra.md and 02-caching.md with full execution plans (branch first, commit/push at logical points, README step, progress documentation step, final step on user approval). Pause for review.
- Create _docs/progress/04-scale/ if it doesn't exist.
```

## References

- Phase plan conventions (branch, commit/push, README, progress, final step): [new-project-setup.md](new-project-setup.md) (section on phase plan conventions).
- Planning content guide: `_docs/planning/milestones/00-initial-milestones/` (README.md and topic files in that folder show the types of content to consider; new milestones use the same single-folder pattern with README.md as overview + links and topic files).
- Existing milestones and phase plans: `_docs/milestones/` (e.g. `01-setup`, `02-mvp`, `03-post-mvp`).

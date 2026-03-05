# New Milestone Setup

Use this guide when **adding a new milestone** to an existing project. For creating a project from scratch, use [new-project-setup.md](new-project-setup.md).

## Parameters

When running the prompts below, supply:

- **Milestone identifier:** Number and name (e.g. `04-scale`, `05-analytics`). Must match the naming in `_docs/milestones/` (number-prefixed, lowercase).
- **Phase names:** One or more phases (e.g. `01-infra`, `02-caching`). Each gets a file in `phases/` and `phase-plans/` with the same number-prefixed filename.

## Steps

1. **Create the milestone folder under `_docs/milestones/`**

   - Add `_docs/milestones/<NN-milestone>/` (e.g. `_docs/milestones/04-scale/`).
   - Inside it, create two subfolders: `phases/` and `phase-plans/`.

2. **Create phase description and phase plan files**

   - In `_docs/milestones/<NN-milestone>/phases/`, add one markdown file per phase (e.g. `01-infra.md`, `02-caching.md`) with a short description of scope and goals.
   - In `_docs/milestones/<NN-milestone>/phase-plans/`, add one markdown file per phase with the **same filenames**, containing the execution plan. Each phase plan must:
     - **First step:** Create and check out branch `<NN-milestone>/<NN-phase>` (e.g. `04-scale/01-infra`).
     - **During the phase:** Include add, commit, and push at logical points.
     - **README step:** When the phase is completed, add or update project-root and per-app READMEs.
     - **Progress documentation:** When the agent completes the phase, add or update `_docs/progress/<NN-milestone>/<NN-phase>.md` with a summary of work done; after user approval, do a final pass on that progress doc and include it in the final commit/push.
     - **Final step:** When the user approves the phase as complete, add, commit, and push the final changes (including any progress doc update).

3. **Optional: milestone-specific planning**

   - If this milestone has its own scope (e.g. a separate project overview or definition), create:
     - `_docs/planning/<NN-milestone>/project-overview/`
     - `_docs/planning/<NN-milestone>/definition/`
   - Add overview or definition docs there as needed. Otherwise, the existing `_docs/planning/project-overview/` and `_docs/planning/definition/` serve the project.

4. **Progress folder**

   - Ensure `_docs/progress/<NN-milestone>/` exists. It will be used when each phase is completed (progress docs created per phase as above).

## Example prompt

```
Create a new milestone 04-scale with two phases: 01-infra and 02-caching.

- Add _docs/milestones/04-scale/ with phases/ and phase-plans/.
- In phases/, add 01-infra.md and 02-caching.md with brief scope and goals.
- In phase-plans/, add 01-infra.md and 02-caching.md with full execution plans (branch first, commit/push at logical points, README step, progress documentation step, final step on user approval).
- Create _docs/progress/04-scale/ if it doesn't exist.
```

## References

- Phase plan conventions (branch, commit/push, README, progress, final step): [new-project-setup.md](new-project-setup.md) (section on phase plan conventions).
- Existing milestones and phase plans: `_docs/milestones/` (e.g. `01-setup`, `02-mvp`, `03-post-mvp`).

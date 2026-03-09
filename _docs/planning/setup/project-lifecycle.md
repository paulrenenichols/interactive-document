# Project lifecycle

Recommended order for creating project docs. Each step builds on the previous. Establishes context (overview, user flow, tech), then rules (tech stack, UI, theme, project rules), then phased milestones.

**Document locations:** Keep all docs under `_docs/`. Project overview: `_docs/planning/milestones/00-initial-milestones/README.md`. Definition docs (user-flow, auth, tech-stack, ui-rules, theme-rules, project-rules) go in the **same folder**. Milestones go in `_docs/milestones/` under `completed/`, `active/`, or `future/`. Setup guides in `_docs/planning/setup/`.

## Milestone structure

`_docs/milestones/` has three subfolders:

- **completed/** — Finished milestones. Only these get number prefixes (e.g. `01-setup`, `02-mvp`).
- **active/** — Milestones currently in progress. No number prefix.
- **future/** — Planned milestones. No number prefix.

New milestones from this flow go in `milestones/future/`. Create `_docs/milestones/README.md` with Completed / Active / Future sections and links.

## Progress structure

`_docs/progress/` mirrors milestones: `progress/completed/`, `progress/active/`, `progress/future/`. Each contains milestone-named subfolders with phase progress files (e.g. `progress/completed/01-setup/01-scaffold.md`).

---

## Steps

1. **README.md** — `_docs/planning/milestones/00-initial-milestones/README.md`. Project purpose, scope, goals. Link to other planning files.

2. **user-flow.md** — How users interact (landing, registration, navigation, etc).

3. **auth.md** — How authentication works.

4. **tech-stack.md** — Core technologies and roles.

5. **ui-rules.md** — Visual and interaction guidelines.

6. **theme-rules.md** — Colors, typography, theming foundations.

7. **project-rules.md** — Folder structure, file naming, conventions.

8. **Milestones** — Create in `_docs/milestones/future/` with no number prefix. Each milestone folder has:
   - **phases/** — Number-prefixed files (e.g. `01-auth.md`) with scope and goals.
   - **phase-plans/** — Same filenames, detailed execution plans.

Phase plan conventions:
- **First step:** Create and check out branch `<milestone>/<phase>` (e.g. `01-setup/01-scaffold`).
- **During:** Add, commit, push at logical points.
- **Final step:** On user approval, add, commit, push final changes.
- **README step:** Add/update project-root and per-app READMEs when phase completes.
- **Progress doc:** Add/update `_docs/progress/<bucket>/<milestone>/<phase>.md` (bucket = completed, active, or future) with summary; final pass after user approval.

9. **Project README** — Update project root README with overview, links to _docs, run/build instructions.

---

## Prompts

1. Use README.md to create user-flow.md (user journey, features, navigation).
2. Use README + user-flow to create auth.md.
3. Use README + user-flow + auth to create tech-stack.md (propose stack, user picks, output to file).
4. Update tech-stack.md with best practices, limitations, conventions.
5. Use README + user-flow + tech-stack to create ui-rules.md and theme-rules.md.
6. Use all definition docs to create project-rules.md (structure, naming, conventions).
7. Use definition docs to create milestones. **Place in `_docs/milestones/future/`** with **no number prefix** (e.g. `setup`, `mvp`, `post-mvp` — not `01-setup`). Each milestone folder has `phases/` and `phase-plans/` with number-prefixed files. Create `_docs/milestones/README.md` with Completed / Active / Future sections. Progress docs: `_docs/progress/future/<milestone>/<phase>.md`.
8. Update project root README.md.

For the milestone creation prompt, specify: milestones go in `_docs/milestones/future/`; names like `setup`, `mvp`, `post-mvp` (no number prefix — numbers are added when milestone is completed); create `_docs/milestones/README.md` with Completed / Active / Future sections.

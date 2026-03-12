---
name: docs-driven-dev
version: "1.2.0"
description: Docs-driven development. Use when setting up docs, converting projects, upgrading, creating explorations, or managing milestones. Accepts both "docs" and "_docs". Ask "help" or "what can you do?" for capabilities.
---

# docs-driven-dev

Docs-driven development: planning, milestones, explorations, and documentation workflows. Consolidates setup, conversion, upgrade, exploration creation/update, and milestone lifecycle management.

## When to use

**First step:** Determine which workflow the user wants from their message or context. Accept both "docs" and "_docs" — "setup docs" and "setup _docs" both trigger setup. If multiple could apply, ask the user to clarify.

| Workflow | Trigger phrases |
|----------|-----------------|
| **Setup docs** | "setup docs", "setup _docs", "scaffold docs", "scaffold _docs", "create docs", "create _docs", "init docs", "docs-driven setup", "new project with docs" |
| **Convert project** | "convert to docs", "convert to _docs", "add docs to project", "add _docs to project", "convert existing project", "docs-driven convert", "add docs to codebase" |
| **Upgrade docs** | "upgrade docs", "upgrade _docs", "upgrade docs project", "update docs structure", "update _docs structure", "docs-driven upgrade", "bring docs up to date" |
| **Create exploration** | "create exploration", "add exploration", "new exploration", "scaffold exploration" |
| **Update exploration** | "update exploration", "add feature sets to exploration" |
| **Create milestone from exploration** | "turn exploration into milestone", "create milestone from exploration", "exploration to milestone", "evaluate exploration and create milestone" |
| **Make milestone active** | "make milestone active", "start milestone", "activate milestone", "move to active", "begin work on" |
| **Mark milestone completed** | "mark milestone completed", "finish milestone", "complete milestone", "move to completed" |
| **Help** | "what can you do", "help", "what capabilities", "docs-driven-dev help" |

---

## Help / What this skill can do

When the user asks "what can you do?", "help", "what capabilities", or similar, respond with this summary:

- **Setup docs** — Create _docs in an empty folder (planning, milestones, progress, setup)
- **Convert project** — Add _docs to an existing codebase (00-initial-milestones with inferred docs; no milestones)
- **Upgrade docs** — Update an existing docs project to the current skill version and structure
- **Create exploration** — New exploration folder with feature-sets and supporting-docs
- **Update exploration** — Update an existing exploration (add feature sets, align to standards)
- **Create milestone from exploration** — Turn an exploration into a milestone in `milestones/future/` and move the exploration to `explorations/completed/`
- **Make milestone active** — Move a future milestone to `active/` and verify phases/phase-plans
- **Mark milestone completed** — Move an active milestone to `completed/` and add number prefix

---

## Git and branching

**Before any branch or commit step:** Check if the project is a git repository (`git rev-parse --is-inside-work-tree`). If no git repo: inform the user; ask (a) Initialize git and create the branch, or (b) Proceed without git. If (b): skip all branch creation and commit/push steps; still perform file changes.

**Branch patterns:**

| Operation | Branch |
|-----------|--------|
| Setup | `docs/setup` |
| Convert | `docs/convert` |
| Upgrade | `docs/upgrade` |
| Create exploration | `explore/create/<name>` |
| Update exploration | `explore/update/<name>` |
| Create milestone | `milestone/create/<name>` |
| Make milestone active (activation only) | `milestone/activate/<name>` |
| Make milestone active (start first phase) | `<milestone>/<phase>` (e.g. `developer-experience/01-dev-stack`) |
| Mark milestone completed | `milestone/complete/<name>` |

Ask user about branch (current vs new from main) per scaffold-exploration pattern. Check if branch name exists; use `-2`, `-3` suffix if needed.

---

## Phase execution workflow

When executing milestone phases:

1. **One phase at a time:** Complete one phase fully, then STOP
2. **User testing:** Inform user phase is complete and ready for testing
3. **PR and merge:** User creates PR, tests, and merges to main
4. **Next phase:** User explicitly asks to start next phase
5. **Branch from main:** Each phase branches from main AFTER previous phase is merged

Do NOT automatically continue to the next phase. The user must explicitly request it after merging the previous phase.

---

## 1. Setup docs (empty folder)

1. Check git; ask about branch. Create branch `docs/setup` from main if user wants new branch.
2. Create `_docs/` structure: `README.md`, `planning/setup/`, `planning/milestones/00-initial-milestones/`, `planning/explorations/`, `planning/explorations/completed/`, `milestones/completed/`, `milestones/active/`, `milestones/future/`, `progress/`, `progress/miscellaneous/`
3. Copy setup files from this skill's `setup/` to `_docs/planning/setup/`: `project-lifecycle.md`, `milestone-lifecycle.md`, `exploration-lifecycle.md`
4. Add `Created with the **docs-driven-dev** skill (vX.Y.Z).` to `_docs/README.md` (read version from this SKILL.md frontmatter)
5. **Embed skill:** Copy this skill folder to project `.cursor/skills/docs-driven-dev/`
6. **Project README:** Add or update project root `README.md` with the full "Docs-driven development" section from `templates/readme-docs-section.md` (including the **How to use the skill** subsection with trigger phrases and steps)
7. Run discussion → draft 00-initial-milestones README → run project-lifecycle flow from `_docs/planning/setup/project-lifecycle.md`
8. Milestones go in `milestones/future/` with no number prefix until completed. Create `milestones/README.md` with Completed / Active / Future sections.
9. Commit with message "chore: add docs-driven-dev _docs structure" (if git)

---

## 2. Convert existing project

1. Check git; ask about branch. Create branch `docs/convert` from main if user wants new branch.
2. Create full `_docs/` structure (same as setup): `milestones/` (completed/, active/, future/), `progress/`, `progress/miscellaneous/`
3. Copy setup files to `_docs/planning/setup/`
4. Create `_docs/planning/milestones/00-initial-milestones/` with **inferred docs**: README.md (project overview from codebase), definition docs (user-flow, auth, tech-stack, ui-rules, theme-rules, project-rules). If something is missing (e.g. no auth), leave it out. If project has non-standard aspects, create appropriately named docs.
5. Create empty `milestones/` and `progress/` structure. No milestone content — user adds later via project-lifecycle.
6. **Embed skill:** Copy to `.cursor/skills/docs-driven-dev/`
7. **Project README:** Add or update project root `README.md` with the full "Docs-driven development" section from `templates/readme-docs-section.md` (including **How to use the skill**)
8. Add `Converted with the **docs-driven-dev** skill (vX.Y.Z).` to `_docs/README.md`
9. Commit (if git)

---

## 3. Upgrade docs project

1. Check git; ask about branch. Create branch `docs/upgrade` from main if user wants new branch.
2. Read current skill version from this SKILL.md frontmatter
3. Update all READMEs/docs with attribution to `Updated with the **docs-driven-dev** skill (vX.Y.Z).`
4. **Migrate progress structure** (v1.1.0): flatten `progress/completed/`, `progress/active/`, `progress/future/` to `progress/<milestone>/`:
   - Move contents of `progress/completed/<milestone>/` to `progress/<milestone>/`
   - Move contents of `progress/active/<milestone>/` to `progress/<milestone>/`
   - Move contents of `progress/future/<milestone>/` to `progress/<milestone>/`
   - Keep `progress/miscellaneous/` as-is
   - Delete empty `completed/`, `active/`, `future/` folders
5. Align milestones structure: ensure `milestones/` has `completed/`, `active/`, `future/`
6. Ensure `milestones/README.md` has Completed / Active / Future sections
7. Ensure setup files match skill's canonical copies
8. Ensure `_docs/planning/explorations/completed/` exists
9. Update exploration READMEs to current standards
10. Preserve prior attribution in parentheses where useful
11. **Embed skill:** Copy current skill to `.cursor/skills/docs-driven-dev/` (overwrite)
12. **Project README:** Add or update the "Docs-driven development" section using full content from `templates/readme-docs-section.md` (including **How to use the skill**)
13. Commit (if git)

---

## 4. Create exploration

Follow scaffold-exploration create flow. Branch: `explore/create/<name>`. Use docs-driven-dev attribution and version. Structure: `_docs/planning/explorations/<name>/README.md`, `feature-sets/`, `supporting-docs/`.

---

## 5. Update exploration

Follow scaffold-exploration update flow. Branch: `explore/update/<name>`. Use docs-driven-dev attribution and version.

---

## 6. Create milestone from exploration

1. Run evaluation per `exploration-lifecycle.md`
2. Follow `milestone-lifecycle.md` to create milestone in `_docs/milestones/future/<name>/` (no number prefix)
3. Create `_docs/progress/<name>/` folder with README.md
4. Move the exploration from `_docs/planning/explorations/<name>/` to `_docs/planning/explorations/completed/<name>/` (create `completed/` if it doesn't exist). Update any relative links in the moved exploration's READMEs that pointed to `../../setup/` (now `../../../setup/`).
5. Branch: `milestone/create/<name>`

---

## 7. Make milestone active

**Ask user which approach:**

- **(a) Activation only:** Create `milestone/activate/<name>` branch, do activation, commit/push. Useful for planning-only review.
- **(b) Start first phase (recommended):** Create first phase branch (e.g. `<milestone>/01-<phase>`), do activation as first commit, then begin phase work.

**If (a) — Activation only:**

1. Create and checkout branch `milestone/activate/<name>`
2. Move folder from `milestones/future/<name>/` to `milestones/active/<name>/`
3. Update path references in phase-plans (future → active)
4. Update `milestones/README.md` index
5. Run **accuracy pass**: quick scan of phases/phase-plans; if problematic, full scan of codebase and update
6. Commit: "chore: activate <name> milestone"

**If (b) — Start first phase:**

1. Identify first phase from `milestones/future/<name>/phase-plans/` (e.g. `01-dev-stack.md`)
2. Create and checkout branch `<name>/<first-phase>` (e.g. `developer-experience/01-dev-stack`)
3. Move folder from `milestones/future/<name>/` to `milestones/active/<name>/`
4. Update path references in phase-plans (future → active)
5. Update `milestones/README.md` index
6. Run **accuracy pass**: quick scan of phases/phase-plans; if problematic, full scan of codebase and update
7. Commit: "chore: activate <name> milestone"
8. Begin phase work per phase-plan (follow Phase execution workflow)

---

## 8. Mark milestone completed

1. Move folder from `milestones/active/<name>/` to `milestones/completed/`
2. Add number prefix = max(completed numbers) + 1 (e.g. `04-<name>`)
3. Update `milestones/README.md` index
4. Branch: `milestone/complete/<name>`

---

## Attribution (version)

Read `version` from this skill's SKILL.md frontmatter at time of run. Use for Created/Converted/Updated/Upgraded lines.

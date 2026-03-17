## Docs-driven development

This project uses the **docs-driven-dev** system for planning, milestones, and documentation.

- **Structure:** See [_docs/](_docs/) for the docs layout — planning, milestones (completed/active/future), progress, and explorations.
- **Skill:** The docs-driven-dev skill is embedded in `.cursor/skills/docs-driven-dev/`; no install needed. Collaborators get it when they clone the repo.

### How to use the skill

1. **Open Cursor Agent chat** — The skill is loaded automatically when this project is open.
2. **See what it can do** — Ask **"help"** or **"what can you do?"** for a full list of capabilities.
3. **Plan-first** — Most workflows show a plan first; say **"go"** (or "apply", "execute") to write to disk.
4. **Run a workflow** — Use plain language; both "docs" and "_docs" work. Examples:
   - *"Setup docs"* / *"scaffold _docs"* — Create _docs in an empty folder (new project). Say **"go"** to apply.
   - *"Convert to docs"* / *"add docs to this project"* — Add _docs to a project (infer from codebase). Say **"go"** to apply.
   - *"Upgrade docs"* / *"upgrade _docs"* — Update _docs to the latest skill version (fetch from GitHub; overwrite or skip).
   - *"Create exploration"* — New exploration under _docs/planning/explorations/. Say **"go"** to apply.
   - *"Update exploration (name)"* — Update an existing exploration (e.g. add feature sets). Say **"go"** to apply.
   - *"Turn exploration X into a milestone"* — Evaluate and create a milestone in milestones/future/. Say **"go"** to apply.
   - *"Make milestone (name) active"* — Move to active and run an accuracy pass; optionally start first phase.
   - *"Implement phase"* / *"go"* (when a milestone is active) — Run phase execution (chunks, lint, test, commit, push, PR).
   - *"Mark milestone (name) completed"* — Move to completed and assign number prefix (also prompted when last phase merges).
   - *"Rollback phase"* / *"rollback chunk"* — Revert last phase or chunk commits (with confirmation).
   - *"Validate"* / *"validate docs"* — Run state check only ("All good" or "Fixes needed").

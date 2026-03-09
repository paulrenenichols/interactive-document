## Docs-driven development

This project uses the **docs-driven-dev** system for planning, milestones, and documentation.

- **Structure:** See [_docs/](_docs/) for the docs layout — planning, milestones (completed/active/future), progress, and explorations.
- **Skill:** The docs-driven-dev skill is embedded in `.cursor/skills/docs-driven-dev/`; no install needed. Collaborators get it when they clone the repo.

### How to use the skill

1. **Open Cursor Agent chat** — The skill is loaded automatically when this project is open.
2. **See what it can do** — Ask **"help"** or **"what can you do?"** for a full list of capabilities.
3. **Run a workflow** — Use plain language; both "docs" and "_docs" work. Examples:
   - *"Upgrade docs"* / *"upgrade _docs"* — Update this project's _docs to the latest skill version and structure.
   - *"Create exploration"* — Start a new exploration under _docs/planning/explorations/.
   - *"Update exploration (name)"* — Update an existing exploration (e.g. add feature sets).
   - *"Turn exploration X into a milestone"* — Evaluate an exploration and create a milestone in milestones/future/.
   - *"Make milestone (name) active"* — Move a future milestone to active and run an accuracy pass.
   - *"Mark milestone (name) completed"* — Move an active milestone to completed and assign a number prefix.
   - *"Convert to docs"* / *"add docs to this project"* — Add _docs to a project that doesn't have it yet (infer from codebase).
   - *"Setup docs"* / *"scaffold _docs"* — Create _docs in an empty folder (new project).

# docs-driven-dev

A Cursor skill for docs-driven development: planning, milestones, explorations, and documentation workflows.

**Current version:** 1.1.0

## What it does

- **Setup docs** — Create _docs in an empty folder (planning, milestones, progress, setup)
- **Convert project** — Add _docs to an existing codebase (inferred docs; no milestones)
- **Upgrade docs** — Update an existing docs project to the current skill version and structure
- **Create / update exploration** — Exploration folders with feature-sets and supporting-docs
- **Milestone lifecycle** — Create milestone from exploration, make active, mark completed

The skill embeds into projects so collaborators get it automatically—no install needed.

## Install

1. Clone this repo:
   ```bash
   git clone https://github.com/paulrenenichols/docs-driven-dev.git
   cd docs-driven-dev
   ```

2. Copy the skill folder to your Cursor skills directory:
   ```bash
   cp -r . ~/.cursor/skills/docs-driven-dev/
   ```
   (Copy the contents of the repo into `~/.cursor/skills/docs-driven-dev/` — SKILL.md, setup/, templates/, etc.)

Or install from a project that already has the skill: copy from that project's `.cursor/skills/docs-driven-dev/`.

## Usage

In a project with _docs, the skill is typically embedded in `.cursor/skills/docs-driven-dev/`. In Cursor Agent chat, say **"help"** or **"what can you do?"** for capabilities.

Trigger with phrases like: "setup docs", "convert to docs", "upgrade docs", "create exploration", "make milestone active", etc. Both "docs" and "_docs" work.

## Supersedes

This skill consolidates and extends:
- [scaffold-docs](https://github.com/paulrenenichols/cursor-skills/tree/main/scaffold-docs)
- [scaffold-exploration](https://github.com/paulrenenichols/cursor-skills/tree/main/scaffold-exploration)

See [cursor-skills](https://github.com/paulrenenichols/cursor-skills) for the original skills. For new adopters, docs-driven-dev is the recommended unified skill.

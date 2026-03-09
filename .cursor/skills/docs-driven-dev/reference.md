# docs-driven-dev — Quick reference

## Attribution

Read `version` from SKILL.md frontmatter. Use in Created/Converted/Updated lines.

## Milestone structure

| Folder | Purpose |
|--------|---------|
| `milestones/future/` | Planned. No number prefix. |
| `milestones/active/` | In progress. No number prefix. |
| `milestones/completed/` | Done. Number prefix (01-, 02-, ...). |

## Progress

Mirrors milestones: `progress/completed/`, `progress/active/`, `progress/future/`. Path: `progress/<bucket>/<milestone>/<phase>.md`.

## Branch patterns

- `docs/setup`, `docs/convert`, `docs/upgrade`
- `explore/create/<name>`, `explore/update/<name>`
- `milestone/create/<name>`, `milestone/activate/<name>`, `milestone/complete/<name>`

## No git

Check before branching. If no repo: inform user; offer init or proceed without branch/commit.

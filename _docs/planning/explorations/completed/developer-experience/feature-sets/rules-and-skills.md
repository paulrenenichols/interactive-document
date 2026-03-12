# Extract _docs processes into rules and skills

## Summary

Look at processes described in `_docs/` and extract them into Cursor **rules** (`.cursor/rules/*.mdc`) and **skills** (`.cursor/skills/*/SKILL.md`) so the agent follows them consistently, without relying only on phase plans in milestones.

## Processes in _docs today

- **Phase plan workflow** ([new-project-setup.md](../../../../setup/new-project-setup.md), [new-milestone-setup.md](../../../../setup/new-milestone-setup.md)): (1) Create and check out branch `<milestone>/<phase>`. (2) Execute tasks; add, commit, and push at logical checkpoints. (3) On phase completion: update project and per-app READMEs; add or update `_docs/progress/<milestone>/<phase>.md`. (4) On user approval: final pass on progress doc, then final commit and push.
- **Exploration evaluation** ([explorations-evaluation.md](../../../../setup/explorations-evaluation.md)): Planning mode; read exploration folder; summarize scope, feasibility, risks, roadmap fit; optional next step = turn into milestone via new-milestone-setup.
- **New milestone creation** ([new-milestone-setup.md](../../../../setup/new-milestone-setup.md)): Create `_docs/milestones/<NN>/` with `phases/` and `phase-plans/`; each phase plan includes branch step, checkpoints, README step, progress doc step, final step; ensure `_docs/progress/<NN>/` exists.
- **Definition docs** (project-rules, ui-rules, theme-rules, tech-stack in `_docs/planning/milestones/00-initial-milestones/`): Conventions for structure, naming, UI, theme. New-project-setup suggests "Agent Rules" at user level; repo-level rules/skills version and share this.

## Proposed extraction

| Target | Format | Content |
|--------|--------|---------|
| **Phase execution** | Skill (e.g. `.cursor/skills/execute-phase-plan/SKILL.md`) | When executing a milestone phase: read phase plan from `_docs/milestones/<N>/phase-plans/<phase>.md`; first step = create/checkout branch; do tasks; commit/push at checkpoints; on completion do README step and progress doc; final step only after user approval. |
| **Exploration evaluation** | Skill (e.g. `.cursor/skills/evaluate-exploration/SKILL.md`) | When asked to evaluate an exploration folder: planning mode; read all markdown; output scope, feasibility, risks, roadmap fit; optional next step = turn into milestone per new-milestone-setup. |
| **New milestone creation** | Skill (e.g. `.cursor/skills/create-milestone/SKILL.md`) | When asked to create a new milestone: follow new-milestone-setup; create folder structure, phase + phase-plan files with required steps; create progress folder. |
| **Project / code conventions** | Rules (`.cursor/rules/*.mdc`) | File-scoped rules: e.g. when editing `apps/frontend/**` follow ui-rules and theme-rules; when editing `apps/api/**` and `apps/frontend/**` follow project-rules and tech-stack (structure, naming, file size, no cross-app imports). |
| **Docs workflow** | Rule | When updating milestone or progress: phase plans in `_docs/milestones/<N>/phase-plans/`; progress docs in `_docs/progress/<milestone>/<phase>.md`; completion = READMEs + progress doc + final commit on approval. |

## Benefits

- Phase work: agent consistently branches first, checkpoints, and updates READMEs and progress docs.
- Explorations: "evaluate this exploration" invokes the same process without pasting the prompt.
- Code: conventions from definition docs apply when working in frontend/api.
- Versioned: rules and skills live in the repo for all contributors.

## Out of scope

- Changing the content of phase plans or definition docs; this is about where and how processes are invoked.

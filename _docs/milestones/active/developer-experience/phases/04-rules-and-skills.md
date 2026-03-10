# Phase: Rules and skills (developer-experience)

Extract _docs processes (phase execution, exploration evaluation, milestone creation, code conventions) into Cursor rules and skills so the agent follows them consistently.

---

## Scope

- **Phase execution** — Skill: when executing a milestone phase, read phase plan; branch first; do tasks; commit/push at checkpoints; README step and progress doc on completion; final step on user approval.
- **Exploration evaluation** — Skill: when evaluating an exploration, planning mode; read all markdown; output scope, feasibility, risks, roadmap fit; optional next step = turn into milestone.
- **Milestone creation** — Skill: when creating a new milestone, follow milestone-lifecycle; create folder structure, phase and phase-plan files, progress folder.
- **Project / code conventions** — Rules: when editing frontend/api, follow ui-rules, theme-rules, project-rules, tech-stack (from 00-initial-milestones).
- **Docs workflow** — Rule: phase plans in `_docs/milestones/.../phase-plans/`; progress in `_docs/progress/...`; completion = READMEs + progress doc + final commit on approval.

---

## Goals

- Phase work: agent consistently branches first, checkpoints, and updates READMEs and progress docs.
- Explorations: "evaluate this exploration" invokes the same process via skill.
- Code: conventions from definition docs apply when working in frontend/api.
- Versioned: rules and skills live in the repo for all contributors.

---

## Out of scope

- Changing the content of phase plans or definition docs; this is where and how processes are invoked.

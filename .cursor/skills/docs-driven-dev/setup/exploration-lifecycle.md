# Exploration lifecycle

Use this in **planning mode** to process and evaluate an exploration folder. Goal: discussion and synthesis, not execution. Do not make changes unless the user explicitly asks to turn the exploration into a milestone.

## How to use

Reference an exploration folder (e.g. `@_docs/planning/explorations/export-pdf`) and run the evaluation. The agent reads the contents, synthesizes the research, and discusses scope, feasibility, risks, and fit with the roadmap.

## Evaluation process

1. Read all markdown files in the exploration folder.
2. Describe any screenshots or other assets (mockups, diagrams, references).
3. Summarize the research: what is being proposed, what problems it addresses, what the scope might be.
4. Identify dependencies, risks, and open questions.
5. Discuss how it fits with existing milestones and the project roadmap.

**Output:** Structured discussion covering:
- Scope (what's in, what's out)
- Feasibility (technical, effort, unknowns)
- Risks and mitigations
- Fit with roadmap (where it might slot in, what it might depend on or unblock)

## Turning exploration into milestone

If the user asks to turn the exploration into a milestone:
1. Follow [milestone-lifecycle.md](milestone-lifecycle.md).
2. Create the milestone in `_docs/milestones/future/<name>/` (no number prefix).
3. Use the exploration's feature sets to inform phase breakdown.

## Creating and updating explorations

Use the docs-driven-dev skill's exploration workflows (plan-first: say "go" to apply):
- **Create:** "create exploration" — plan from exploration-template, then "go" to create README, feature-sets/, supporting-docs/.
- **Update:** "update exploration" — plan updates, then "go" to apply; set "Updated with" version.
- See [watchdog-rules.md](watchdog-rules.md) for state checks after create/update.

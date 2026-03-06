# Explorations Evaluation

Use this prompt in **planning mode** to process and evaluate an exploration folder. The goal is discussion and synthesis, not execution. Do not make changes unless the user explicitly asks to turn the exploration into a milestone.

## How to use

Reference an exploration folder (e.g. `@_docs/planning/explorations/export-pdf`) and run this prompt. The agent will read the contents, synthesize the research, and discuss scope, feasibility, risks, and fit with the roadmap.

## Prompt

```
Process and evaluate the exploration folder I'm referencing.

**Mode:** Planning mode. Discuss, synthesize, and evaluate. Do not execute changes unless I explicitly ask you to turn this exploration into a milestone.

**Process:**
1. Read all markdown files in the exploration folder.
2. Describe any screenshots or other assets (mockups, diagrams, references).
3. Summarize the research: what is being proposed, what problems it addresses, what the scope might be.
4. Identify dependencies, risks, and open questions.
5. Discuss how it fits with existing milestones and the project roadmap.

**Output:** Provide a structured discussion covering:
- Scope (what's in, what's out)
- Feasibility (technical, effort, unknowns)
- Risks and mitigations
- Fit with roadmap (where it might slot in, what it might depend on or unblock)

**Optional next step:** If I ask you to turn this exploration into a milestone, follow [new-milestone-setup.md](new-milestone-setup.md) to create the milestone structure (_docs/milestones/<NN-milestone>/, phases, phase-plans, and optionally project-overview and definition under _docs/planning/milestones/<NN-milestone>/).
```

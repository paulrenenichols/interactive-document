# Workflow Update 2026 March 06

- first step: create and check out branch `docs/workflow-update-2026-March-06` (or equivalent) before making any changes.

- add an explorations folder to \_docs/planning. the explorations folder should have subfolders named after proposed feature sets (e.g. export-pdf, real-time-collaboration, analytics). each subfolder can contain a mixture of markdown files, screenshots, and other file types that constitute research into future milestones.

- add \_docs/planning/setup/explorations-evaluation.md. this document is a prompt for planning mode: it describes how to process and evaluate an exploration folder (read markdown, review screenshots, synthesize findings). the agent should discuss scope, feasibility, risks, and fit with existing milestones. the user may ask to turn an exploration into a milestone; when they do, the agent should follow new-milestone-setup.md to scaffold it. the prompt is for discussion and evaluation, not execution, unless the user explicitly asks to create a milestone.

- add \_docs/planning/explorations/README.md with a short description of the explorations folder and a link to the evaluation prompt.

- update \_docs/README.md to mention the explorations folder under the planning section and to reference planning/setup/explorations-evaluation.md as the prompt for evaluating explorations.
